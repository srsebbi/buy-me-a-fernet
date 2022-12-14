'use client';

import { useEffect, useState } from 'react';
import { DONATION_IN_CENTS, MAX_DONATION_IN_CENTS } from '../config';
import Image from 'next/image';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { GetServerSideProps } from 'next';
import { Record } from '../types';

export default function Home() {
	const router = useRouter();
	const [error, setError] = useState(null);
	const [quantity, setQuantity] = useState(1);
	const [name, setName] = useState('');
	const [message, setMessage] = useState('');
	const [donations, setDonations] = useState<Array<Record> | null>(null);
	const presets = [1, 3, 5];

	useEffect(() => {
		const getData = async () => {
			const response = await fetch(`/api/donations`);

			const donations = await response.json();
			console.log('donations', donations);

			setDonations(donations);
			return {
				props: {
					donations,
				},
			};
		};
		getData();
		console.log('ACA LAS DONACIONES', donations);
		// const data = await fetch(`http://localhost:3000/api/donations`);
	}, []);

	async function handlerCheckout() {
		setError(null);
		const response = await fetch('/api/checkout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				quantity,
				name,
				message,
			}),
		});

		const res = await response.json();

		if (res.url) {
			const url = res.url;
			router.push(url);
		}

		if (res.error) {
			setError(res.error);
		}
	}

	return (
		<main className={styles.mainContainer}>
			<div>
				<h2>Previous Donations</h2>
				{donations ? (
					donations.map((donation) => {
						return (
							<div key={donation.id}>
								<h2>{donation.fields.name}</h2>
								<h3>{donation.fields.message}</h3>
							</div>
						);
					})
				) : (
					<div></div>
				)}
			</div>
			<div>
				<h1>Buy me a fernet!</h1>
				{error && <div>{error}</div>}
				<div className={styles.quantityContainer}>
					<span>
						<Image src="/fernet.png" width="50" height="60" alt="fernet" />
					</span>
					<span>X</span>
					{presets.map((preset) => {
						return (
							<button key={preset} onClick={() => setQuantity(preset)}>
								{preset}
							</button>
						);
					})}
					<input
						type="number"
						onChange={(e) => setQuantity(parseFloat(e.target.value))}
						value={quantity}
						min={1}
						max={MAX_DONATION_IN_CENTS / DONATION_IN_CENTS}
					/>
				</div>
				<div className={styles.donationParameters}>
					<label htmlFor="name">Name</label>
					<input
						type="text"
						name=""
						id="name"
						onChange={(e) => setName(e.target.value)}
						value={name}
					/>
					<label htmlFor="message">Message</label>
					<textarea
						name=""
						id="message"
						onChange={(e) => setMessage(e.target.value)}
						value={message}
						placeholder="Thank you"
					/>
				</div>
			</div>
			<button onClick={handlerCheckout}>
				Donate ${quantity * (DONATION_IN_CENTS / 100)}
			</button>
		</main>
	);
}
