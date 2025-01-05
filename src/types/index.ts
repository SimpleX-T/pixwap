export interface User {
	id: string;
	email: string;
	displayName: string;
	pfpUrl?: string;
	subscription_status: "free" | "premium";
	subscription_id: string;
}

export interface Event {
	id: string;
	title: string;
	description: string;
	bannerImageUrl: string;
	created_at: Date;
	user_id: string;
	images: Image[];
	viewerEmails: string[];
	downloads: DownloadRecord[];
}

interface DownloadRecord {
	user_email: string;
	download_date: Date;
}

export interface Image {
	id: string;
	url: string;
	created_at: Date;
	event_id: string;
}

export interface Subscription {
	id: string;
	user_id: string;
	plan: "free" | "premium";
	status: "active" | "ended";
	start_date: Date;
	end_date: Date;
}

export interface Download {
	id: string;
	event_id: string;
	user_email: string;
	download_date: Date;
}
