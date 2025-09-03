import { CategoryManager } from "@/components/settings/category-manager";
import { CurrencyManager } from "@/components/settings/currency-manager";
import { ProfileManager } from "@/components/settings/profile-manager";

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <ProfileManager />
            <CategoryManager />
            <CurrencyManager />
        </div>
    )
}
