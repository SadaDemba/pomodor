import {
	addDoc,
	collection,
	doc,
	getDocs,
	query,
	setDoc,
	where,
} from "firebase/firestore";
import { db, auth } from "./firebaseConfig";
import { Session } from "@/models/Session";

export const saveUserToFirestore = async (
	firstName: string,
	lastName: string
) => {
	const userEmail: string = auth.currentUser?.email ?? "";
	if (!userEmail) {
		console.error("User is not authenticated.");
		return;
	}

	try {
		const userRef = doc(db, "users", userEmail);
		await setDoc(
			userRef,
			{ firstName, lastName, email: userEmail },
			{ merge: true }
		);
		console.log("User data saved successfully!");
	} catch (error) {
		console.error("Error saving user data: ", error);
	}
};

export const saveSessionToFirestore = async (sessionData: Session) => {
	const userEmail: string = auth.currentUser?.email ?? "";
	if (!userEmail) {
		console.error("User is not authenticated.");
		return;
	}

	try {
		const sessionRef = collection(db, "sessions");
		await addDoc(sessionRef, { userEmail, ...sessionData });

		console.log("Session data saved successfully!");
	} catch (error) {
		console.error("Error saving session data: ", error);
	}
};

export const getCurrentUserSessions = async () => {
	const userEmail: string = auth.currentUser?.email ?? "";
	if (!userEmail) {
		console.error("User is not authenticated.");
		return;
	}
	try {
		const sessionsRef = collection(db, "sessions");
		const q = query(sessionsRef, where("userEmail", "==", userEmail));
		const querySnapshot = await getDocs(q);
		const sessions: Session[] = [];
		querySnapshot.docs.forEach((doc) => {
			sessions.push(Session.fromFirestore(doc.data(), doc.id));
		});

		console.log(sessions);
		return sessions;
	} catch (error) {
		console.error("Error fetching user sessions: ", error);
		return [];
	}
};
