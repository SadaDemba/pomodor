import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { HomePage } from "@/Components/Screens/homePage";
import "../utils/firebaseConfig";
import { durations } from "@/utils/defaultDurations";
import { storeData, getData } from "@/utils/LocalStorage";

export default function Index() {
	const [expoPushToken, setExpoPushToken] = useState("");
	const [notification, setNotification] = useState<
		Notifications.Notification | undefined
	>(undefined);
	const notificationListener = useRef<Notifications.Subscription>();
	const responseListener = useRef<Notifications.Subscription>();

	useEffect(() => {
		registerForPushNotificationsAsync().then(
			(token) => token && setExpoPushToken(token)
		);

		notificationListener.current =
			Notifications.addNotificationReceivedListener((notification) => {
				setNotification(notification);
			});

		responseListener.current =
			Notifications.addNotificationResponseReceivedListener((response) => {});

		AddLocalData();

		return () => {
			notificationListener.current &&
				Notifications.removeNotificationSubscription(
					notificationListener.current
				);
			responseListener.current &&
				Notifications.removeNotificationSubscription(responseListener.current);
		};
	}, []);

	return <HomePage />;
}

async function AddLocalData() {
	const focusDuration = await getData("focusDuration");
	const relaxDuration = await getData("relaxDuration");
	if (!focusDuration) {
		storeData("focusDuration", durations[1].focusDuration.toString());
	}

	if (relaxDuration) {
		storeData("focusDuration", durations[1].relaxDuration.toString());
	}
}

async function registerForPushNotificationsAsync() {
	let token;

	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.MAX,
			sound: "notification-sound.mp3",
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#FF231F7C",
		});
	}

	if (Device.isDevice) {
		const { status: existingStatus } =
			await Notifications.getPermissionsAsync();
		let finalStatus = existingStatus;
		if (existingStatus !== "granted") {
			const { status } = await Notifications.requestPermissionsAsync();
			finalStatus = status;
		}
		if (finalStatus !== "granted") {
			alert("Failed to get push token for push notification!");
			return;
		}
	}

	return token;
}
