import { useState } from "react";
import { HiOutlineCheck, HiOutlineCog, HiOutlineSave } from "react-icons/hi";
import { DashboardLayout } from "../../components";
import { Button, Card, Input } from "../../components/ui";

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "Job Tracking System",
    companyEmail: "info@jts.com",
    companyPhone: "+1234567890",
    companyAddress: "123 Main Street, City, Country",
    currency: "USD",
    taxRate: "10",
    jobNumberPrefix: "JOB",
    autoAssignJobs: true,
    emailNotifications: true,
    smsNotifications: false,
    lowStockThreshold: "10",
    defaultDeadlineDays: "7",
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save settings logic here
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout userRole="admin" userName="Admin" notificationCount={0}>
      <div className="space-y-6 font-[family-name:var(--font-family-primary)]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-secondary-100">
              System Settings
            </h1>
            <p className="text-sm text-custom-700 mt-1">
              Configure system-wide settings and preferences
            </p>
          </div>
          <Button
            onClick={handleSave}
            className="flex items-center gap-2 self-start sm:self-auto"
          >
            {saved ? (
              <>
                <HiOutlineCheck className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <HiOutlineSave className="w-4 h-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Company Information */}
        <Card className="!p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
              <HiOutlineCog className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-secondary-100">Company Information</h2>
              <p className="text-xs text-custom-700">Basic company details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-custom-700 mb-2">
                Company Name
              </label>
              <Input
                type="text"
                value={settings.companyName}
                onChange={(e) =>
                  setSettings({ ...settings, companyName: e.target.value })
                }
                fullWidth
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-custom-700 mb-2">
                Company Email
              </label>
              <Input
                type="email"
                value={settings.companyEmail}
                onChange={(e) =>
                  setSettings({ ...settings, companyEmail: e.target.value })
                }
                fullWidth
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-custom-700 mb-2">
                Company Phone
              </label>
              <Input
                type="tel"
                value={settings.companyPhone}
                onChange={(e) =>
                  setSettings({ ...settings, companyPhone: e.target.value })
                }
                fullWidth
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-custom-700 mb-2">
                Currency
              </label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="RWF">RWF - Rwandan Franc</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-custom-700 mb-2">
                Company Address
              </label>
              <textarea
                value={settings.companyAddress}
                onChange={(e) =>
                  setSettings({ ...settings, companyAddress: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 rounded-xl border border-custom-300 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
        </Card>

        {/* Job Settings */}
        <Card className="!p-6">
          <h2 className="text-lg font-bold text-secondary-100 mb-6">Job Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-custom-700 mb-2">
                Job Number Prefix
              </label>
              <Input
                type="text"
                value={settings.jobNumberPrefix}
                onChange={(e) =>
                  setSettings({ ...settings, jobNumberPrefix: e.target.value })
                }
                fullWidth
                placeholder="JOB"
              />
              <p className="text-xs text-custom-700 mt-1">
                Example: {settings.jobNumberPrefix}-2026-001
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-custom-700 mb-2">
                Default Deadline (Days)
              </label>
              <Input
                type="number"
                value={settings.defaultDeadlineDays}
                onChange={(e) =>
                  setSettings({ ...settings, defaultDeadlineDays: e.target.value })
                }
                fullWidth
              />
            </div>
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoAssignJobs}
                  onChange={(e) =>
                    setSettings({ ...settings, autoAssignJobs: e.target.checked })
                  }
                  className="w-5 h-5 rounded accent-primary-500 cursor-pointer"
                />
                <div>
                  <span className="text-sm font-semibold text-secondary-100">
                    Auto-assign jobs to departments
                  </span>
                  <p className="text-xs text-custom-700">
                    Automatically assign jobs based on workload
                  </p>
                </div>
              </label>
            </div>
          </div>
        </Card>

        {/* Financial Settings */}
        <Card className="!p-6">
          <h2 className="text-lg font-bold text-secondary-100 mb-6">Financial Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-custom-700 mb-2">
                Default Tax Rate (%)
              </label>
              <Input
                type="number"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                fullWidth
              />
            </div>
          </div>
        </Card>

        {/* Inventory Settings */}
        <Card className="!p-6">
          <h2 className="text-lg font-bold text-secondary-100 mb-6">Inventory Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-custom-700 mb-2">
                Low Stock Alert Threshold (%)
              </label>
              <Input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) =>
                  setSettings({ ...settings, lowStockThreshold: e.target.value })
                }
                fullWidth
              />
              <p className="text-xs text-custom-700 mt-1">
                Alert when stock falls below this percentage of minimum level
              </p>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="!p-6">
          <h2 className="text-lg font-bold text-secondary-100 mb-6">
            Notification Settings
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, emailNotifications: e.target.checked })
                }
                className="w-5 h-5 rounded accent-primary-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold text-secondary-100">
                  Email Notifications
                </span>
                <p className="text-xs text-custom-700">
                  Send email notifications for important events
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) =>
                  setSettings({ ...settings, smsNotifications: e.target.checked })
                }
                className="w-5 h-5 rounded accent-primary-500 cursor-pointer"
              />
              <div>
                <span className="text-sm font-semibold text-secondary-100">
                  SMS Notifications
                </span>
                <p className="text-xs text-custom-700">
                  Send SMS notifications for urgent events
                </p>
              </div>
            </label>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            className="flex items-center gap-2"
            size="lg"
          >
            {saved ? (
              <>
                <HiOutlineCheck className="w-5 h-5" />
                Settings Saved!
              </>
            ) : (
              <>
                <HiOutlineSave className="w-5 h-5" />
                Save All Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
