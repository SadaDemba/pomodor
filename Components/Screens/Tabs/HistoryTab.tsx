import { Session } from "@/models/Session";
import { useCallback, useEffect, useState } from "react";
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	SafeAreaView,
	TouchableOpacity,
	RefreshControl,
} from "react-native";
import { deleteUserSessions, getCurrentUserSessions } from "@/utils/Firestore";
import { secondsToHMS, dateFormatter } from "@/utils/ConvertToHms";
import { useFocusEffect } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Alert } from "react-native";

type SortOption = {
	label: string;
	key: keyof Session | "none";
	ascending: boolean;
};

export function HistoryScreen() {
	const [sessions, setSessions] = useState<Session[]>([]);
	const [refreshing, setRefreshing] = useState(false);
	const [currentSort, setCurrentSort] = useState<SortOption>({
		label: "Plus récent",
		key: "endDate",
		ascending: false,
	});

	const sortOptions: SortOption[] = [
		{ label: "Plus récent", key: "endDate", ascending: false },
		{ label: "Plus ancien", key: "endDate", ascending: true },
		{ label: "Durée focus", key: "focusDuration", ascending: true },
		{ label: "Durée focus", key: "focusDuration", ascending: false },
		{ label: "Temps concentré", key: "focusedTime", ascending: true },
		{ label: "Temps concentré", key: "focusedTime", ascending: false },
		{ label: "Itérations", key: "iterationsNumber", ascending: true },
		{ label: "Itérations", key: "iterationsNumber", ascending: false },
	];

	const handleDelete = async () => {
		try {
			await deleteUserSessions();
			await fetchSessions();
		} catch (error) {
			console.error("Erreur lors de la suppression:", error);
			Alert.alert("Erreur", "Impossible de supprimer l'historique");
		}
	};

	const sortSessions = (sessionsToSort: Session[], sortOption: SortOption) => {
		if (sortOption.key === "none") return sessionsToSort;

		return [...sessionsToSort].sort((a, b) => {
			const valueA = a[sortOption.key as keyof Session];
			const valueB = b[sortOption.key as keyof Session];

			if (valueA === valueB) return 0;

			const comparison = valueA! < valueB! ? -1 : 1;
			return sortOption.ascending ? comparison : -comparison;
		});
	};

	const fetchSessions = async () => {
		try {
			setRefreshing(true);
			const userSessions = await getCurrentUserSessions();
			if (userSessions) {
				const sortedSessions = sortSessions(userSessions, currentSort);
				setSessions(sortedSessions);
			}
		} catch (error) {
			console.error("Erreur lors du chargement:", error);
			Alert.alert("Erreur", "Impossible de charger l'historique");
		} finally {
			setRefreshing(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchSessions();
			return () => {};
		}, [])
	);

	useEffect(() => {
		const sortedSessions = sortSessions(sessions, currentSort);
		setSessions(sortedSessions);
	}, [currentSort]);

	const handleSort = (option: SortOption) => {
		setCurrentSort(option);
	};

	const renderSortButtons = () => (
		<View style={styles.sortContainer}>
			<Text style={styles.sortTitle}>Trier par :</Text>
			<FlatList
				horizontal
				data={sortOptions}
				renderItem={({ item }) => {
					const isActive =
						currentSort.label === item.label &&
						currentSort.ascending === item.ascending;
					return (
						<TouchableOpacity
							style={[styles.sortButton, isActive && styles.sortButtonActive]}
							onPress={() => handleSort(item)}
						>
							<View style={styles.sortButtonContent}>
								<Text
									style={[
										styles.sortButtonText,
										isActive && styles.sortButtonTextActive,
									]}
								>
									{item.label}
								</Text>
								<MaterialIcons
									name={item.ascending ? "arrow-upward" : "arrow-downward"}
									size={16}
									color={isActive ? "white" : "#DDD"}
								/>
							</View>
						</TouchableOpacity>
					);
				}}
				keyExtractor={(item, index) =>
					`${item.label}-${item.ascending}-${index}`
				}
				showsHorizontalScrollIndicator={false}
			/>
		</View>
	);

	const renderItem = ({ item }: { item: Session }) => (
		<TouchableOpacity style={styles.sessionItem}>
			<View style={styles.sessionDetails}>
				<View style={styles.detailRow}>
					<Text style={styles.sessionText}>
						Focus: {item.focusDuration / 60} min, Relax:{" "}
						{item.relaxDuration / 60} min
					</Text>
				</View>
				<View style={styles.detailRow}>
					<Text style={styles.sessionText}>
						Concentration: {secondsToHMS(item.focusedTime)}
					</Text>
				</View>
				<View style={styles.detailRow}>
					<Text style={styles.sessionText}>
						Repos: {secondsToHMS(item.relaxedTime)}
					</Text>
				</View>
				<View style={styles.detailRow}>
					<Text style={styles.sessionText}>
						Nombre d'itération(s): {item.iterationsNumber}
					</Text>
				</View>
				<View style={styles.detailRow}>
					<Text style={styles.sessionText}>
						Début de session: {dateFormatter(item.beginDate!)}
					</Text>
				</View>
				<View style={styles.detailRow}>
					<Text style={styles.sessionText}>
						Fin de session: {dateFormatter(item.endDate)}
					</Text>
				</View>
			</View>
		</TouchableOpacity>
	);

	const onRefresh = useCallback(() => {
		fetchSessions();
	}, [currentSort]);

	const renderEmptyComponent = () => (
		<View style={styles.emptyContainer}>
			<Text style={styles.emptyText}>Aucune donnée disponible</Text>
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<View style={styles.headerLeft}>
					<View style={{ width: 34 }} />
				</View>
				<View style={styles.headerCenter}>
					<Text style={styles.title}>Historique</Text>
				</View>
				<View style={styles.headerRight}>
					<TouchableOpacity
						onPress={() =>
							Alert.alert(
								"Confirmation",
								"Voulez-vous vraiment supprimer l'historique ?",
								[
									{ text: "Annuler", style: "cancel" },
									{ text: "Confirmer", onPress: () => handleDelete() },
								]
							)
						}
						style={styles.trashButton}
						activeOpacity={0.1}
					>
						<MaterialIcons name="delete" size={24} color="white" />
					</TouchableOpacity>
				</View>
			</View>
			{renderSortButtons()}
			<FlatList
				data={sessions}
				renderItem={renderItem}
				keyExtractor={(item, index) => `${item.getId()}}`}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.listContent}
				ListEmptyComponent={renderEmptyComponent}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={["tomato"]} // Pour Android
						tintColor="tomato" // Pour iOS
					/>
				}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#1E1E1E",
	},
	header: {
		padding: 20,
		backgroundColor: "#2C2C2C",
		borderBottomWidth: 1,
		borderBottomColor: "#444",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	headerLeft: {
		flex: 1,
		alignItems: "flex-start",
	},
	headerCenter: {
		flex: 2,
		alignItems: "center",
	},
	headerRight: {
		flex: 1,
		alignItems: "flex-end",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "white",
	},
	sortContainer: {
		paddingVertical: 10,
		paddingHorizontal: 15,
		backgroundColor: "#2C2C2C",
	},
	sortTitle: {
		fontSize: 16,
		color: "white",
		marginBottom: 10,
	},
	sortButton: {
		paddingHorizontal: 15,
		paddingVertical: 8,
		backgroundColor: "#444",
		borderRadius: 20,
		marginRight: 10,
		marginBottom: 5,
	},
	sortButtonActive: {
		backgroundColor: "tomato",
	},
	sortButtonText: {
		color: "white",
		fontSize: 14,
	},
	sortButtonTextActive: {
		fontWeight: "bold",
	},
	listContent: {
		padding: 20,
	},
	sessionItem: {
		backgroundColor: "tomato",
		padding: 15,
		borderRadius: 10,
		marginVertical: 10,
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.5,
		shadowRadius: 3,
	},
	sessionText: {
		fontSize: 16,
		color: "white",
	},
	sessionDetails: {
		marginTop: 10,
	},
	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 5,
	},
	emptyContainer: {
		alignItems: "center",
		justifyContent: "center",
		marginTop: 20,
	},
	emptyText: {
		fontSize: 18,
		color: "#aaa",
	},
	trashButton: {
		paddingHorizontal: 10,
		alignContent: "flex-end",
		borderRadius: 4,
		backgroundColor: "tomato",
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		color: "white",
	},
	sortButtonContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
});
