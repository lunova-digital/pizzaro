import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, DollarSign, Clock, CheckCircle } from "lucide-react";

export default async function AdminDashboard() {
  await auth();
  await dbConnect();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [allOrders, todayOrders] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).limit(10),
    Order.find({ createdAt: { $gte: today } }),
  ]);

  const todayRevenue = todayOrders.reduce((s, o) => s + o.totalAmount, 0);
  const pendingOrders = allOrders.filter((o) =>
    ["placed", "preparing"].includes(o.status)
  ).length;
  const deliveredToday = todayOrders.filter((o) =>
    ["delivered", "picked-up"].includes(o.status)
  ).length;

  const stats = [
    {
      label: "Today's Orders",
      value: todayOrders.length,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Today's Revenue",
      value: formatPrice(todayRevenue),
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "Completed Today",
      value: deliveredToday,
      icon: CheckCircle,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  const statusColors: Record<string, string> = {
    placed: "bg-blue-100 text-blue-700",
    preparing: "bg-yellow-100 text-yellow-700",
    "out-for-delivery": "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
    "ready-for-pickup": "bg-purple-100 text-purple-700",
    "picked-up": "bg-green-100 text-green-700",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-dark mb-8">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-dark">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-dark">Recent Orders</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {allOrders.length === 0 ? (
            <p className="px-6 py-8 text-gray-400 text-center">
              No orders yet
            </p>
          ) : (
            allOrders.map((order) => (
              <div
                key={order._id.toString()}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-dark text-sm">
                    #{order._id.toString().slice(-6).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {order.items.length} item(s) •{" "}
                    {new Date(order.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-dark">
                    {formatPrice(order.totalAmount)}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[order.status] || "bg-gray-100"}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
