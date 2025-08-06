import React from "react";
import Link from "next/link";
import { AppIcon } from "../..";

export default function BackButton({ href, size = 24, className = "" }) {
	return (
		<Link href={href}>
			<AppIcon name="back" size={size}  className={`text-primary cursor-pointer ${className}`}/>
		</Link>
	);
}
