import moment from "moment";
import { formatBalance } from "@polkadot/util";

export function shortenAddress(address) {
	if (!address) return;
	return `${address.slice(0, 5)}....${address.slice(-4)}`;
}

export function formatNumber(amount) {
	return new Intl.NumberFormat().format(amount);
}

export function percentNumber(amount) {
	return `${parseFloat(amount).toFixed(2)}%`;
}

export function balanceFormat(amount) {
	const data = parseFloat(amount / Math.pow(10, 18));

	return new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 18,
		maximumFractionDigits: 18,
	}).format(data);
}

export function standardBalance(amount) {
	const data = parseFloat(amount / Math.pow(10, 18));

	return new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 6,
		maximumFractionDigits: 6,
	}).format(data);
}

export function formatAccountBalanceSEL(amount) {
	return parseInt(amount).toLocaleString("en-US");
}

export function timeDuration(time, roughly = false) {
	if (!time) {
		return "Unknown time";
	}
	moment.updateLocale("en", {
		relativeTime: {
			future: "in %s",
			past: "%s ",
			s: (number) => `${number} secs ago `,
			ss: "%d secs ago",
			m: "1 min ago",
			mm: "%d mins ago",
			h: "1 hour ago ",
			hh: "%d hours ago",
			d: "1 day ago",
			dd: "%dd ago",
			M: "1 month ago ",
			MM: "%d months ago ",
			y: "1 year ago",
			yy: "%d years ago",
		},
	});
	const now = moment();
	if (!now.isAfter(time)) {
		//todo 讨论当客户端时间不准时应当如何处理
		return moment(time).fromNow();
	}
	let ss = now.diff(time, "seconds");
	let mm = now.diff(time, "minutes");
	let hh = now.diff(time, "hours");
	const dd = now.diff(time, "days");
	if (dd) {
		hh %= 24;
		if (hh && !roughly) {
			return `${dd} day${dd > 1 ? "s" : ""} ${hh} hr${hh > 1 ? "s" : ""} ago`;
		}
		return `${dd} day${dd > 1 ? "s" : ""} ago`;
	}
	if (hh) {
		mm %= 60;
		if (mm && !roughly) {
			return `${hh} hr${hh > 1 ? "s" : ""} ${mm} min${mm > 1 ? "s" : ""} ago`;
		}
		return `${hh} hr${hh > 1 ? "s" : ""} ago`;
	}
	if (mm) {
		ss %= 60;
		if (ss && !roughly) {
			return `${mm} min${mm > 1 ? "s" : ""} ${ss} sec${ss > 1 ? "s" : ""} ago`;
		}
		return `${mm} min${mm > 1 ? "s" : ""} ago`;
	}
	return `${ss} sec${ss > 1 ? "s" : ""} ago`;
}
