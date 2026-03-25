import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, User, Settings, LogOut, Zap } from "lucide-react"

import { useAuth } from "@/context/AuthContext"
import { ThemeToggle } from "@/components/ThemeToggle"
import { DashboardTab } from "@/components/tabs/DashboardTab"
import { ProfileTab } from "@/components/tabs/ProfileTab"
import { SettingsTab } from "@/components/tabs/SettingsTab"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const tabs = [
	{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ id: "profile", label: "Profile", icon: User },
	{ id: "settings", label: "Settings", icon: Settings },
] as const

type TabId = (typeof tabs)[number]["id"]

const tabContent: Record<TabId, React.FC> = {
	dashboard: DashboardTab,
	profile: ProfileTab,
	settings: SettingsTab,
}

const pageVariants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 },
}

const tabContentVariants = {
	initial: { opacity: 0, y: 8 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -8 },
}

export default function Home() {
	const { logout, user } = useAuth()
	const [activeTab, setActiveTab] = useState<TabId>("dashboard")

	const handleLogout = async () => {
		await logout()
	}

	const ActiveContent = tabContent[activeTab]

	return (
		<motion.div
			variants={pageVariants}
			initial="initial"
			animate="animate"
			exit="exit"
			transition={{ duration: 0.4, ease: "easeOut" as const }}
			className="flex min-h-svh flex-col bg-background"
		>
			{/* ── Compact top header ── */}
			<header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
				<div className="flex h-14 items-center justify-between px-4">
					<div className="flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
							<Zap className="h-4 w-4 text-primary-foreground" />
						</div>
						<span className="text-base font-bold tracking-tight">Synapse</span>
					</div>

					<div className="flex items-center gap-1">
						<span className="hidden text-sm text-muted-foreground sm:inline">
							{user?.email}
						</span>
						<ThemeToggle />
						<Button
							variant="ghost"
							size="icon"
							onClick={handleLogout}
							className="h-10 w-10 rounded-full text-muted-foreground hover:text-destructive"
							aria-label="Sign out"
						>
							<LogOut className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</header>

			<Separator />

			{/* ── Scrollable content area ── */}
			<main className="flex-1 px-4 py-4 pb-24">
				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						variants={tabContentVariants}
						initial="initial"
						animate="animate"
						exit="exit"
						transition={{ duration: 0.25, ease: "easeOut" as const }}
					>
						<ActiveContent />
					</motion.div>
				</AnimatePresence>
			</main>

			{/* ── Fixed bottom tab bar ── */}
			<nav
				className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-lg"
				style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
			>
				<div className="flex h-16 items-stretch justify-around">
					{tabs.map((tab) => {
						const isActive = activeTab === tab.id
						return (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
									isActive
										? "text-primary"
										: "text-muted-foreground active:text-foreground"
								}`}
								aria-label={tab.label}
							>
								{/* Active indicator dot */}
								{isActive && (
									<motion.div
										layoutId="activeTab"
										className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
										transition={{ type: "spring", stiffness: 400, damping: 30 }}
									/>
								)}
								<tab.icon
									className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`}
								/>
								<span className="text-[10px] font-medium leading-tight">
									{tab.label}
								</span>
							</button>
						)
					})}
				</div>
			</nav>
		</motion.div>
	)
}
