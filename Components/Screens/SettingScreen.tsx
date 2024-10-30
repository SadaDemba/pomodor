import { useEffect, useState } from "react";
import { Alert, TouchableOpacity } from "react-native";
import { View, Text, SafeAreaView, StyleSheet } from "react-native";
import { durations } from "@/utils/defaultDurations";
import { storeData, getData } from "@/utils/LocalStorage";
import { useFocusEffect } from "expo-router";
import React from "react";

export const SettingsScreen = () => {
	const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
	const loadDuration = async () => {
		const savedDuration = await getData("selectedDuration");
		setSelectedDuration(savedDuration ? parseInt(savedDuration) : 1);
		const timerStatus = await getData("timerStatus");
		setIsclosed(timerStatus === "up" ? false : true);
	};
	const [isClosed, setIsclosed] = useState(false);

	useFocusEffect(
		React.useCallback(() => {
			loadDuration();
		}, [])
	);

	const handleSelectDuration = async (key: number) => {
		if (!isClosed) {
			Alert.alert(
				"Action impossible",
				"Vous ne pouvez pas changer la durée pendant qu'un timer est en cours."
			);
			return;
		}

		setSelectedDuration(key);
		await storeData("selectedDuration", key.toString());

		Alert.alert("Succès", "Les durées ont été mises à jour avec succès !", [
			{ text: "OK" },
		]);
	};

	const isOptionDisabled = !isClosed;

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.title}>Paramètres</Text>
			</View>
			<View style={styles.optionsContainer}>
				<Text style={styles.optionLabel}>
					Choisir la durée de focus et de relaxation :
				</Text>
				{Object.entries(durations).map(([key, value]) => (
					<TouchableOpacity
						key={key}
						style={[
							styles.optionButton,
							selectedDuration === parseInt(key) && styles.selectedOption,
						]}
						onPress={() => handleSelectDuration(parseInt(key))}
						disabled={isOptionDisabled}
					>
						<Text
							style={[
								styles.optionText,
								isOptionDisabled && styles.disabledText,
							]}
						>
							Focus: {value.focusDuration / 60} min, Relax:{" "}
							{value.relaxDuration / 60} min
						</Text>
					</TouchableOpacity>
				))}
				{isOptionDisabled && (
					<Text style={styles.warningText}>
						Les modifications sont désactivées pendant qu'un timer est en cours
					</Text>
				)}
			</View>
		</SafeAreaView>
	);
};

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
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		color: "white",
	},

	optionsContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	optionLabel: {
		fontSize: 18,
		color: "white",
		marginBottom: 20,
	},
	optionButton: {
		width: "100%",
		padding: 15,
		borderWidth: 1,
		borderColor: "#555",
		borderRadius: 8,
		marginBottom: 10,
		backgroundColor: "#444",
	},
	selectedOption: {
		backgroundColor: "#3498db",
	},
	optionText: {
		color: "white",
		textAlign: "center",
		fontSize: 16,
	},
	disabledText: {
		color: "#999",
	},
	warningText: {
		color: "#ff6b6b",
		textAlign: "center",
		marginTop: 10,
		fontSize: 14,
	},
});
