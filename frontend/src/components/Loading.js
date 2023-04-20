import React from "react";
import Lottie from "lottie-react";
import loading from "../assets/loadings/loading5.json";

function Loading() {
	return (
		<div className="loading-container">
			<Lottie animationData={loading} loop={true} />
			<p>Loading...</p>
		</div>
	);
}

export { Loading };
