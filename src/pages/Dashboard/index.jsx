import { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import MainContainer from "../../layouts/MainContainer";
import SentimentCard from "../../components/SentimentCard";
import { getAllLeaveApplication } from "../../lib/appwrite";

const index = () => {
  const toastRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    rejected: 0,
    pending: 0,
    cancelled: 0,
    avgConfidence: 0,
  });

  const [chartData, setChartData] = useState([
    { name: "Approved", value: stats.approved, color: "#22c55e" },
    { name: "Rejected", value: stats.rejected, color: "#ef4444" },
    { name: "Pending", value: stats.pending, color: "#06b6d4" },
    { name: "Cancelled", value: stats.cancelled, color: "#f97316" },
  ]);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    handleGetLeaveApplication();
  }, []);

  const handleGetLeaveApplication = async () => {
    try {
      const res = await getAllLeaveApplication();
      const counts = res.rows.reduce(
        (acc, cur) => {
          if (cur.status == "pending") acc.pending++;
          if (cur.status == "rejected") acc.rejected++;
          if (cur.status == "approved") acc.approved++;
          if (cur.status == "cancelled") acc.cancelled++;
          return acc;
        },
        { approved: 0, rejected: 0, pending: 0, cancelled: 0 },
      );

      setStats({ ...counts, total: res.total });
      setChartData([
        { name: "Approved", value: counts.approved, color: "#22c55e" },
        { name: "Rejected", value: counts.rejected, color: "#ef4444" },
        { name: "Pending", value: counts.pending, color: "#06b6d4" },
        { name: "Cancelled", value: counts.cancelled, color: "#f97316" },
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error("Error:", error.message);
      setError(error.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      toastRef.current.show({
        severity: "error",
        summary: "Error",
        detail: error,
        life: 3000,
        onHide: () => setError(null),
      });
    }
  }, [error]);

  return (
    <MainContainer toast={toastRef}>
      <div className="p-4 animate-fadeIn">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              label: "Pending Application",
              value: stats.pending,
              icon: "fa-bullseye",
              color: "text-amber-600",
            },
            {
              label: "Approved Application",
              value: stats.approved,
              icon: "fa-smile",
              color: "text-green-600",
            },
            {
              label: "Cancelled Application",
              value: stats.cancelled,
              icon: "fa-frown",
              color: "text-red-600",
            },
            {
              label: "Rejected Application",
              value: stats.rejected,
              icon: "fa-frown",
              color: "text-red-600",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.label}
                </span>
                <i className={`fas ${item.icon} ${item.color} text-sm`}></i>
              </div>
              <div className="text-2xl font-bold text-slate-800">
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm text-center font-bold text-slate-800 mb-4 uppercase tracking-wider">
              Leave Application
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-sm text-center font-bold text-slate-800 mb-4 uppercase tracking-wider">
              Volume Distribution
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Audit Log
              <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                {/* {sentiments.length} */}
              </span>
            </h2>

            <a
              href={`/sentiments/download`}
              download
              className="border border-gray-200 shadow py-2 px-4 rounded"
            >
              <span className="text-sm mr-2">Export</span>
              <i
                className="fa fa-download text-sm"
                data-pr-tooltip="Download"
              ></i>
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 h-full">
            <div className="relative h-[26vh] overflow-auto">
              <div className="h-full border border-slate-200 bg-white rounded-md"></div>
              {/* {sentiments.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl py-20 flex flex-col items-center justify-center text-slate-400">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <i className="fas fa-inbox text-2xl"></i>
                                </div>
                                <p className="font-medium">
                                    Analysis history is empty
                                </p>
                            </div>
                        ) : sentiments.length > 5 ? (
                            sentiments.slice(0, 5).map((res) => (
                                <SentimentCard
                                    key={res.id}
                                    result={res}
                                    //onDelete={deleteResult}
                                />
                            ))
                        ) : (
                            sentiments.map((res) => (
                                <SentimentCard
                                    key={res.id}
                                    result={res}
                                    //onDelete={deleteResult}
                                />
                            ))
                        )} */}
            </div>
          </div>
        </div>
      </div>
    </MainContainer>
  );
};

export default index;
