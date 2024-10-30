import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import {
	getFocusedRouteNameFromRoute,
	useNavigation,
	useRoute,
} from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DrawerHeader } from "@/Components/drawer/DrawerHeader";
import { styles } from "@/Components/drawer/styles";
import { auth } from "@/utils/firebaseConfig";

export const CustomDrawerContent = () => {
	const navigation = useNavigation();
	const route = useRoute();
	const routeName = getFocusedRouteNameFromRoute(route);

	const menuItems = [
		{
			label: "Accueil",
			icon: "home-circle",
			screen: "HomeStack",
		},
		{
			label: "Paramètres",
			icon: "cog",
			screen: "Settings",
		},
	];

	const handleLogout = () => {
		auth.signOut().then(() => console.log("User signed out!"));
	};

	return (
		<View style={styles.container}>
			<DrawerHeader />
			<DrawerContentScrollView>
				<View style={styles.menuContainer}>
					{menuItems.map((item) => (
						<TouchableOpacity
							key={item.screen}
							style={[
								styles.menuItem,
								routeName === item.screen && styles.activeMenuItem,
							]}
							onPress={() => navigation.navigate(item.screen)}
						>
							<MaterialCommunityIcons
								name={item.icon}
								size={24}
								color={routeName === item.screen ? "white" : "gray"}
							/>
							<Text
								style={[
									styles.menuItemText,
									routeName === item.screen && styles.activeMenuItemText,
								]}
							>
								{item.label}
							</Text>
						</TouchableOpacity>
					))}
				</View>
			</DrawerContentScrollView>
			<TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
				<MaterialCommunityIcons name="logout" size={24} color="white" />
				<Text style={styles.logoutText}>Déconnexion</Text>
			</TouchableOpacity>
		</View>
	);
};
