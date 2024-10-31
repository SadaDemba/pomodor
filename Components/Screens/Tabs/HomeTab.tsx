import { Mode, Timer } from "@/models/Timer";
import { useState, useEffect, useRef } from "react";
import Icon from "react-native-vector-icons/FontAwesome";
import * as Notifications from "expo-notifications";
import {
	View,
	Text,
	ImageBackground,
	StyleSheet,
	Alert,
	TouchableOpacity,
} from "react-native";
import CircularProgress from "react-native-circular-progress-indicator";
import { Session } from "@/models/Session";
import { saveSessionToFirestore } from "@/utils/Firestore";
import { getData } from "@/utils/LocalStorage";
import { durations } from "@/utils/defaultDurations";
import { useFocusEffect } from "expo-router";
import React from "react";
import { storeData } from "@/utils/LocalStorage";

export function HomeScreen() {
	const [focusDuration, setFocusDuration] = useState(60);
	const [relaxDuration, setRelaxDuration] = useState(30);
	const timer = useRef(new Timer(focusDuration, relaxDuration));
	const [remainingTime, setRemainingTime] = useState(
		timer.current.remainingTime
	);
	const [isActive, setIsActive] = useState(timer.current.isActive);
	const [isClosed, setIsClosed] = useState(timer.current.isClosed);

	useFocusEffect(
		React.useCallback(() => {
			const updateDurations = async () => {
				try {
					const key = await getData("selectedDuration");
					if (key) {
						const currentDuration = durations[parseInt(key)];
						setFocusDuration(currentDuration.focusDuration);
						setRelaxDuration(currentDuration.relaxDuration);
					}
				} catch (error) {
					console.error("Erreur de récupération des durées:", error);
				}
			};

			updateDurations();
		}, [])
	);

	useEffect(() => {
		storeData("timerStatus", "down");
		timer.current = new Timer(focusDuration, relaxDuration);
		setRemainingTime(timer.current.remainingTime);
	}, [focusDuration, relaxDuration]);

	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldShowAlert: true,
			shouldPlaySound: true,
			shouldSetBadge: true,
			priority: Notifications.AndroidNotificationPriority.HIGH,
		}),
	});

	const updateData = () => {
		setRemainingTime(timer.current.remainingTime);
		setIsActive(timer.current.isActive);
		setIsClosed(timer.current.isClosed);
	};

	const changeMode = () => {
		if (timer.current.currentMode === Mode.Focus) {
			timer.current.currentMode = Mode.Relax;
			timer.current.remainingTime = relaxDuration;
		} else {
			timer.current.currentMode = Mode.Focus;
			timer.current.remainingTime = focusDuration;
		}
		setRemainingTime(timer.current.remainingTime);
		if (timer.current.currentMode === Mode.Focus) timer.current.iterations++;
	};

	const startTimer = () => {
		storeData("timerStatus", "up");
		timer.current.isActive = true;
		setIsActive(timer.current.isActive);
		if (!timer.current.startedAt) timer.current.startedAt = new Date();
		timer.current.timer = setInterval(() => {
			if (!timer.current.isActive || timer.current.isClosed) {
				clearInterval(timer.current.timer);
			} else {
				setRemainingTime(timer.current.remainingTime);
				if (timer.current.remainingTime <= 0) {
					Notifications.scheduleNotificationAsync({
						content: {
							title: "Pomodoro",
							body: "Fin de votre phase de " + getModeToString(),
							priority: "high",
							sound: "notification-sound.mp3",
							data: { data: "some data" },
						},
						trigger: { seconds: 2 },
					});
					changeMode();
				} else {
					timer.current.remainingTime--;
				}
				setRemainingTime(timer.current.remainingTime);
			}
		}, 1000);
	};

	const stopTimer = () => {
		clearInterval(timer.current.timer);
		timer.current.isActive = false;
		setIsActive(timer.current.isActive);
	};

	const resetTimer = () => {
		clearInterval(timer.current.timer);
		let session = new Session(timer.current);
		saveSessionToFirestore(session);
		timer.current.remainingTime = timer.current.workDuration;
		timer.current.isActive = false;
		timer.current.isClosed = false;
		timer.current.iterations = 1;
		timer.current.currentMode = Mode.Focus;
		updateData();
		storeData("timerStatus", "down");
	};

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};

	const getModeToString = (): string => {
		return timer.current.currentMode === Mode.Focus ? "concentration" : "repos";
	};
	const showModeRender = () => {
		if (timer.current.isActive) {
			return <Text style={styles.modeText}>Mode {getModeToString()}</Text>;
		}
		return <Text style={styles.modeText}>Démarrer {getModeToString()}</Text>;
	};

	const confirmReset = () => {
		stopTimer();
		Alert.alert(
			"Confirmation",
			"Êtes-vous sûr de vouloir réinitialiser le timer ?",
			[
				{
					text: "Annuler",
					onPress: () => startTimer(),
					style: "cancel",
				},
				{
					text: "Réinitialiser",
					onPress: () => resetTimer(),
					style: "destructive",
				},
			],
			{ cancelable: true }
		);
	};

	const progress =
		timer.current.currentMode === Mode.Focus
			? (remainingTime / focusDuration) * 100
			: (remainingTime / relaxDuration) * 100;

	return (
		<ImageBackground
			source={require("@/assets/images/home-bg.png")}
			style={styles.backgroundImage}
		>
			<View style={styles.content}>
				{showModeRender()}

				<CircularProgress
					value={progress}
					radius={120}
					duration={1000}
					showProgressValue={false}
					maxValue={100}
					title={formatTime(remainingTime)}
					titleColor={"#fff"}
					titleStyle={{ fontWeight: "light", fontSize: 40 }}
					activeStrokeColor={"#fff"}
					inActiveStrokeColor={"#2ecc71"}
					inActiveStrokeOpacity={0.2}
					inActiveStrokeWidth={5}
					activeStrokeWidth={5}
				/>

				<View style={styles.buttonsContainer}>
					<TouchableOpacity
						style={[
							styles.button,
							isActive ? styles.stopButton : styles.startButton,
						]}
						onPress={isActive ? stopTimer : startTimer}
					>
						<View style={styles.buttonContent}>
							{!isActive && (
								<Icon name="play" size={16} color="black" style={styles.icon} />
							)}
							<Text style={styles.buttonText}>
								{isActive ? "Pause" : "Lancer"}
							</Text>
						</View>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.button, { opacity: isActive ? 1 : 0.3 }]}
						onPress={confirmReset}
						disabled={!isActive}
					>
						<Text style={styles.buttonText}>Arrêter</Text>
					</TouchableOpacity>
				</View>

				<Text style={styles.iterations}>
					Session : {timer.current.iterations}
				</Text>
			</View>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	backgroundImage: {
		flex: 1,
		resizeMode: "cover",
		justifyContent: "center",
	},
	modeText: {
		fontSize: 32,
		color: "white",

		marginBottom: 150,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		padding: 10,
		borderRadius: 25,
		overflow: "hidden",
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	title: {
		fontSize: 32,
		color: "white",
		fontWeight: "bold",
	},
	button: {
		paddingVertical: 15,
		paddingHorizontal: 30,
		borderRadius: 25,
		marginHorizontal: 10,
		backgroundColor: "white",
		borderWidth: 2,
	},
	startButton: {
		borderColor: "#2ecc71",
	},
	stopButton: {
		borderColor: "#e74c3c",
	},
	buttonText: {
		color: "black",
		fontWeight: "bold",
		fontSize: 16,
	},
	buttonsContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 60,
	},
	icon: {
		marginRight: 8,
	},
	iterations: {
		fontSize: 18,
		color: "white",
		marginTop: 20,
	},
	buttonContent: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
});
