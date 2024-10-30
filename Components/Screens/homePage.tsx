import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { DrawerNavigator } from "../Navigation/DrawerNavigator";
import { AuthScreen } from "./AuthScreen";
import { auth } from "../../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { RootStackParamList } from "../Navigation/types";
import { ActivityIndicator, View, Text } from "react-native";

const Stack = createStackNavigator<RootStackParamList>();

export function HomePage() {
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (usr) => {
			setUser(usr);
			const loadingTimer = setTimeout(() => {
				setIsLoading(false);
			}, 1500); // 1,5 secondes

			return () => {
				clearTimeout(loadingTimer);
			};
		});
		return () => unsubscribe();
	}, []);
	if (isLoading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" color="tomato" />
				<Text>Chargement ...</Text>
			</View>
		);
	}

	return (
		<NavigationContainer independent={true}>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				{user ? (
					<Stack.Screen name="Main" component={DrawerNavigator} />
				) : (
					<Stack.Screen name="Auth" component={AuthScreen} />
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}
