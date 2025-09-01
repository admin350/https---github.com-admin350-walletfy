import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>
                        Manage your workspaces, transaction categories, and account settings here.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Manage Categories</h3>
                        <p className="text-muted-foreground mb-3">Create, edit, and delete your custom categories for income and expenses.</p>
                        <Button>Manage Categories</Button>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Manage Workspaces</h3>
                        <p className="text-muted-foreground mb-3">Switch between or create new workspaces.</p>
                        <Button>Manage Workspaces</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
