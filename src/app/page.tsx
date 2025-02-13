"use client";

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "./styles.css";

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

export default function ListPage() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<
    { id: string; name: string; amount: string; url: string; price: string }[]
  >([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [url, setUrl] = useState("");
  const [price, setPrice] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const q = query(collection(db, "items"));
    onSnapshot(q, (snapshot) => {
      setItems(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            amount: data.amount,
            url: data.url,
            price: data.price,
          };
        })
      );
    });
  }, []);

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
    }
  };

  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error(error);
    }
  };

  const logout = () => {
    signOut(auth);
  };

  const addItem = async () => {
    if (!user) return;
    await addDoc(collection(db, "items"), {
      name,
      amount,
      url,
      price,
    });
    setName("");
    setAmount("");
    setUrl("");
    setPrice("");
  };

  const removeItem = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "items", id));
  };

  const calculateTotal = () => {
    return (
      items
        .reduce((total, item) => {
          const price = parseFloat(
            item.price.replace(",", ".").replace("€", "")
          );
          return total + price;
        }, 0)
        .toFixed(2)
        .replace(".", ",") + "€"
    );
  };

  return (
    <div>
      <div className="top-bar">
        <h1 className="title">Dasukin Karkkilista</h1>
        {user ? (
          <div className="user">
            <div className="auth-buttons">
              <button className="auth-button" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="user">
            <div className="credentials">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
              />
            </div>
            <div className="auth-buttons">
              <button className="auth-button" onClick={login}>
                Login
              </button>
              <button className="auth-button" onClick={register}>
                Register
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="form-container">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="Käntty"
        />
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="1"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="https://wiki.paivola.fi/wiki/Käntty"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem()}
          placeholder="0,00€"
        />
        <button className="add" onClick={addItem}>
          Add Item
        </button>
      </div>
      <ul className="karkit">
        {items.map((item, index) => (
          <li className="karkki" key={index}>
            {`${item.name} * ${item.amount} // ${item.url} // ${item.price}`}
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </li>
        ))}
        <li className="karkki" key="total">
          Total: {calculateTotal()}
        </li>
      </ul>
    </div>
  );
}
