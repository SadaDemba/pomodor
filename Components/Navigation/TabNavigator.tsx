import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { HomeScreen } from "@/Components/Screens/Tabs/HomeTab";
import { HistoryScreen } from "@/Components/Screens/Tabs/HistoryTab";
import { tabBarIconMapping, tabBarColors } from "./NavigationConfig";
import { HomeTabParamList } from "@/Components/Navigation/types";
import MaterialCommunityIcons from "@expo/vector-icons/build/MaterialCommunityIcons";

const Tab = createBottomTabNavigator<HomeTabParamList>();

export const TabNavigator = () => {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				headerShown: false,
				tabBarIcon: ({ focused }) => {
					const iconName = tabBarIconMapping[route.name];
					const iconColor = focused
						? tabBarColors.activeTint
						: tabBarColors.inactiveTint;

					return (
						<MaterialCommunityIcons
							name={iconName}
							size={24}
							color={iconColor}
							accessibilityLabel={route.name}
						/>
					);
				},
				tabBarActiveTintColor: tabBarColors.activeTint,
				tabBarInactiveTintColor: tabBarColors.inactiveTint,
				tabBarActiveBackgroundColor: tabBarColors.activeBackground,
				tabBarInactiveBackgroundColor: tabBarColors.inactiveBackground,
				tabBarStyle: {
					shadowColor: "black",
					paddingBottom: 0,
					height: 60,
					position: "absolute",
				},
				tabBarLabelStyle: {
					fontSize: 14,
					fontWeight: "bold",
					paddingBottom: 10,
				},
			})}
		>
			<Tab.Screen
				name="HomeTab"
				component={HomeScreen}
				options={{
					tabBarLabel: "Accueil",
				}}
			/>
			<Tab.Screen
				name="History"
				component={HistoryScreen}
				options={{
					tabBarLabel: "Historique",
				}}
			/>
		</Tab.Navigator>
	);
};
