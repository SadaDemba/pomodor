import { Stack } from "expo-router";
import "../utils/firebaseConfig";

export default function RootLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="index" />
		</Stack>
	);
}
