import { BackgroundManager } from "@/components/profile/background-manager";
import { CategoryManager } from "@/components/profile/category-manager";
import { CurrencyManager } from "@/components/profile/currency-manager";
import { ProfileManager } from "@/components/profile/profile-manager";

export default function ProfilePage() {
    return (
        <div className="space-y-8">
            <ProfileManager />
            <CategoryManager />
            <CurrencyManager />
            <BackgroundManager />
        </div>
    )
}
