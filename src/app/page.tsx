"use client";

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
} from "firebase/firestore";
import { useRouter } from 'next/navigation';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function HomePage() {
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "users"));
    onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({
        id: doc.id,
        username: doc.data().username,
      })));
    });
  }, []);

  const goToUserList = (id: string) => {
    router.push(`/list/${id}`);
  };

  return (
    <div>
      <h1>Karkkilistat</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <a onClick={() => goToUserList(user.id)}>{user.username}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
