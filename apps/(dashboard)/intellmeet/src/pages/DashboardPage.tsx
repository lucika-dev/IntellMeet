import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { ArrowUpRight } from 'lucide-react';

import { meetingsApi } from '../api/meetingsApi';

import { PageTransition } from '../components/PageTransition';
import { MeetingCard } from '../components/MeetingCard';

import { useAuthStore } from '../store/authStore';

const ctaForStatus = (status: string) => {
	if (status === 'live') return 'Join';

	if (
		status === 'recorded' ||
		status === 'ended'
	) {
		return 'Summary';
	}

	return 'Register';
};

const RingStat = ({
	title,
	value,
}: {
	title: string;
	value: number;
}) => {
	const radius = 80;

	const stroke = 15;

	const normalizedRadius =
		radius - stroke / 2;

	const circumference =
		normalizedRadius * 2 * Math.PI;

	const strokeDashoffset =
		circumference -
		(value / 100) * circumference;

	return (
		<div
			className="
				flex
				min-h-[260px]
				flex-col
				items-center
				justify-center
				border-r
				border-border
				bg-background
				px-8
				py-10
				last:border-r-0
			"
		>
			<h3
				className="
					mb-8
					text-lg
					font-semibold
					tracking-tight
					text-foreground
				"
			>
				{title}
			</h3>

			<div className="relative h-44 w-44">
				<svg
					height="176"
					width="176"
					viewBox="0 0 176 176"
					className="-rotate-90"
				>
					<circle
						cx="88"
						cy="88"
						r={normalizedRadius}
						fill="transparent"
						stroke="currentColor"
						strokeWidth={stroke}
						className="
							text-neutral-200
							dark:text-neutral-800
						"
					/>

					<circle
						cx="88"
						cy="88"
						r={normalizedRadius}
						fill="transparent"
						stroke="currentColor"
						strokeWidth={stroke}
						strokeLinecap="round"
						strokeDasharray={`${circumference} ${circumference}`}
						strokeDashoffset={
							strokeDashoffset
						}
						className="
							text-black
							dark:text-white
							transition-all
							duration-700
						"
					/>
				</svg>

				<div
					className="
						absolute
						inset-0
						flex
						flex-col
						items-center
						justify-center
					"
				>
					<div
						className="
							text-6xl
							font-semibold
							leading-none
							tracking-tight
							text-foreground
						"
					>
						{value}
					</div>

					<div
						className="
							mt-2
							text-lg
							font-medium
							text-muted-foreground
						"
					>
						/100
					</div>
				</div>
			</div>
		</div>
	);
};

export const DashboardPage = () => {
	const { user } = useAuthStore();

	const { data: meetings = [] } = useQuery({
		queryKey: ['meetings'],
		queryFn: meetingsApi.fetchMeetings,
		staleTime: 30_000,
	});

	const liveMeetings = meetings.filter(
		(meeting) => meeting.status === 'live'
	);

	const upcomingMeetings = meetings
		.filter(
			(meeting) =>
				meeting.status === 'scheduled'
		)
		.slice(0, 4);

	const pastMeetings = meetings
		.filter(
			(meeting) =>
				meeting.status === 'recorded' ||
				meeting.status === 'ended'
		)
		.slice(0, 4);

	const engagementScore = Math.min(
		100,
		52 +
			liveMeetings.length * 6 +
			upcomingMeetings.length * 3
	);

	const qualityScore = Math.min(
		100,
		58 +
			pastMeetings.length * 5 +
			meetings.length * 2
	);

	const fairnessScore = Math.min(
		100,
		55 +
			new Set(
				meetings.map(
					(meeting) =>
						meeting.creator_user_id
				)
			).size *
				4
	);

	return (
		<PageTransition>
			<div
				className="
					mx-auto
					w-full
					max-w-7xl
					p-6
				"
			>
				<div className="mb-8">
					<h1
						className="
							text-5xl
							font-semibold
							tracking-tight
							text-foreground
						"
					>
						My Activity
					</h1>

					<p
						className="
							mt-3
							text-base
							text-muted-foreground
						"
					>
						Welcome back,{' '}
						{user?.name || 'User'}.
					</p>
				</div>

				<div
					className="
						grid
						overflow-hidden
						border
						border-border
						bg-background
						md:grid-cols-3
					"
				>
					<RingStat
						title="Engagement"
						value={engagementScore}
					/>

					<RingStat
						title="Quality"
						value={qualityScore}
					/>

					<RingStat
						title="Fairness"
						value={fairnessScore}
					/>
				</div>

				<div
					className="
						mt-10
						space-y-8
					"
				>
					<section
						className="
							glass-card
							border
							border-border/40
							p-6
						"
					>
						<div
							className="
								mb-6
								flex
								items-center
								justify-between
								gap-4
							"
						>
							<div>
								<h2
									className="
										text-2xl
										font-semibold
										text-foreground
									"
								>
									Upcoming Meetings
								</h2>

								<p
									className="
										mt-1
										text-sm
										text-muted-foreground
									"
								>
									Scheduled sessions ready
									for your team.
								</p>
							</div>

							<Link
								to="/meetings"
								className="
									inline-flex
									items-center
									gap-2
									border
									border-border/50
									bg-background/40
									px-4
									py-2
									text-sm
									font-medium
									text-foreground
									backdrop-blur-xl
									transition-colors
									hover:bg-accent/30
								"
							>
								Manage

								<ArrowUpRight
									size={16}
								/>
							</Link>
						</div>

						<div
							className="
								grid
								grid-cols-1
								gap-5
								lg:grid-cols-2
							"
						>
							{upcomingMeetings.map(
								(meeting) => (
									<MeetingCard
										key={
											meeting.id
										}
										meeting={
											meeting
										}
										actionLabel={ctaForStatus(
											meeting.status
										)}
										actionTo={
											meeting.meeting_url
										}
									/>
								)
							)}

							{upcomingMeetings.length ===
								0 && (
								<div
									className="
										border
										border-dashed
										border-border/50
										bg-background/40
										p-6
										text-sm
										text-muted-foreground
										lg:col-span-2
									"
								>
									No upcoming meetings
									yet.
								</div>
							)}
						</div>
					</section>

					<section
						className="
							glass-card
							border
							border-border/40
							p-6
						"
					>
						<div
							className="
								mb-6
								flex
								items-center
								justify-between
								gap-4
							"
						>
							<div>
								<h2
									className="
										text-2xl
										font-semibold
										text-foreground
									"
								>
									Recorded Meetings
								</h2>

								<p
									className="
										mt-1
										text-sm
										text-muted-foreground
									"
								>
									Recorded rooms and
									completed sessions.
								</p>
							</div>

							<Link
								to="/analytics"
								className="
									inline-flex
									items-center
									gap-2
									border
									border-border/50
									bg-background/40
									px-4
									py-2
									text-sm
									font-medium
									text-foreground
									backdrop-blur-xl
									transition-colors
									hover:bg-accent/30
								"
							>
								Analytics

								<ArrowUpRight
									size={16}
								/>
							</Link>
						</div>

						<div
							className="
								grid
								grid-cols-1
								gap-5
								lg:grid-cols-2
							"
						>
							{pastMeetings.map(
								(meeting) => (
									<MeetingCard
										key={
											meeting.id
										}
										meeting={
											meeting
										}
										actionLabel={ctaForStatus(
											meeting.status
										)}
										actionTo={`${meeting.meeting_url}/summary`}
										tone="recorded"
									/>
								)
							)}

							{pastMeetings.length ===
								0 && (
								<div
									className="
										border
										border-dashed
										border-border/50
										bg-background/40
										p-6
										text-sm
										text-muted-foreground
										lg:col-span-2
									"
								>
									Recorded meetings will
									appear here after a
									session is ended and
									saved.
								</div>
							)}
						</div>
					</section>
				</div>
			</div>
		</PageTransition>
	);
};