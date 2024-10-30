import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { TabNavigator } from "./TabNavigator";
import { SettingsScreen } from "@/Components/Screens/SettingScreen";
import { CustomDrawerContent } from "@/Components/drawer/CustomDrawerContent";
import { DrawerParamList } from "@/Components/Navigation/types";

const Drawer = createDrawerNavigator<DrawerParamList>();

export const DrawerNavigator = () => {
	return (
		<Drawer.Navigator
			screenOptions={{
				headerShown: false,
				drawerStyle: {
					backgroundColor: "#ffffff",
				},
			}}
			drawerContent={() => <CustomDrawerContent />}
		>
			<Drawer.Screen name="HomeStack" component={TabNavigator} />
			<Drawer.Screen name="Settings" component={SettingsScreen} />
		</Drawer.Navigator>
	);
};
