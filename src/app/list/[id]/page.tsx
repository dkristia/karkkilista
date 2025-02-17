"use client";

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  query,
  onSnapshot,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import TopBar from "@/components/TopBar";

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
const db = getFirestore(app);

export default function ListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useAuth();
  const [listOwner, setListOwner] = useState<{
    id: string;
    username: string;
  } | null>(null);
  const [items, setItems] = useState<
    { id: string; name: string; amount: number; url: string; price: string }[]
  >([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(1);
  const [url, setUrl] = useState("");
  const [finalPrice, setFinalPrice] = useState("0,00€");
  const [unitPrice, setUnitPrice] = useState("")
  const [id, setId] = useState<string | null>(null);
  const [fetchUrl, setFetchUrl] = useState("");

  useEffect(() => {
    params.then((resolvedParams) => {
      setId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (id) {
      const userDoc = doc(db, "users", id as string);
      getDoc(userDoc).then((doc) => {
        if (doc.exists()) {
          setListOwner({ id: doc.id, username: doc.data().username });
        }
      });

      const q = query(collection(db, "users", id as string, "items"));
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
    }
  }, [id]);

  const addItem = async () => {
    if (!user || !listOwner || user.uid !== listOwner.id) return;
    await addDoc(collection(db, "users", id as string, "items"), {
      name,
      amount,
      url,
      price: finalPrice,
    });
    setName("");
    setAmount(1);
    setUrl("");
    setUnitPrice("");
    setFinalPrice("0,00€");
  };

  const removeItem = async (itemId: string) => {
    if (!user || !listOwner || user.uid !== listOwner.id) return;
    await deleteDoc(doc(db, "users", id as string, "items", itemId));
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

  const fetchData = async () => {
    try {
      const response = await fetch(
        `/api/fetch-data?url=${encodeURIComponent(fetchUrl)}`
      );
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");

      const nameElement = doc.querySelector('[itemprop="name"]');
      const priceElement = doc.getElementsByClassName("price")[0];

      const fetchedName: string = nameElement?.textContent ?? "";
      const fetchedPrice: string = priceElement?.textContent ?? "";

      setName(fetchedName);
      setUnitPrice(fetchedPrice ?? "");
      setFinalPrice(fetchedPrice ?? "");
      setUrl(fetchUrl);
      setFetchUrl("");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const priceMultiply = (str: string, times: number) => {
    return str ? ((parseFloat(str.replace(",", ".").replace("€", "")) * times).toFixed(2).replace(".", ",") + "€") : "0,00€";
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = parseInt(e.target.value);
    setAmount(newAmount);
    const newPrice = priceMultiply(unitPrice, newAmount);
    setFinalPrice(newPrice);
  };

  if (!listOwner) return <div>Loading...</div>;

  return (
    <div>
      <TopBar listOwner={listOwner} />
      {user && user.uid === listOwner.id && (
        <>
          <div className="form-container">
            <input
              value={fetchUrl}
              onChange={(e) => setFetchUrl(e.target.value)}
              placeholder="Paste URL here"
            />
            <button onClick={fetchData}>Fetch Data</button>
          </div>
          <div className="form-container">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item Name"
            />
            <input
              value={amount}
              type="number"
              onChange={(e) => handleAmountChange(e)}
              placeholder="Amount"
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Item URL"
            />
            <input
              value={unitPrice}
              onChange={(e) => {setUnitPrice(e.target.value); setFinalPrice(priceMultiply(e.target.value, amount))}}
              placeholder="Unit price (0,00€)"
            />
            <p>
              Total price: {finalPrice}
            </p>
            <button onClick={addItem}>Add Item</button>
          </div>
        </>
      )}
      <ul className="karkit">
        {items.map((item) => (
          <li className="karkki" key={item.id}>
            {`${item.name} * ${item.amount} // `}
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              {item.url}
            </a>
            {` // ${item.price}`}
            {user && user.uid === listOwner.id && (
              <button onClick={() => removeItem(item.id)}>Remove</button>
            )}
          </li>
        ))}
        <li className="karkki no-underline" key="total">
          Total: {calculateTotal()}
        </li>
      </ul>
    </div>
  );
}