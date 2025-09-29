import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { Bell, Moon, Sun, User } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Card component
function Card({
  title,
  to,
  color,
  img,
}: {
  title: string;
  to: string;
  color: string;
  img: string;
}) {
  return (
    <Link to={to} className="block">
      <motion.div
        whileHover={{
          scale: 1.05,
          boxShadow: `0 0 25px ${color}`,
        }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center cursor-pointer"
      >
        {/* Image */}
        <img
          src={img}
          alt={title}
          className="w-40 h-40 object-contain mb-3 rounded-xl"
        />
        {/* Title */}
        <h3 className="text-xl font-semibold" style={{ color: color }}>
          {title}
        </h3>
        <p className="text-gray-500 mt-1 text-sm">Go to {title}</p>
      </motion.div>
    </Link>
  );
}

export default function Dashboard() {
  const [darkMode, setDarkMode] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Logs + news articles
  const activity = [
    {
      log: "Prediction for Kerala region – High Risk (85%)",
      link: "https://www.thehindu.com/news/national/kerala/forest-fire-alert-kerala/article12345.ece",
    },
    {
      log: "Realtime monitoring session started – Tamil Nadu",
      link: "https://indianexpress.com/article/tamil-nadu/forest-fire-monitoring-tn-67890/",
    },
    {
      log: "Prediction for Odisha – Moderate Risk (60%)",
      link: "https://timesofindia.indiatimes.com/city/bhubaneswar/odisha-forest-fire-prediction/articleshow/67890.cms",
    },
  ];

  const data = [
    { name: "Jan", predictions: 30, fires: 25 },
    { name: "Feb", predictions: 50, fires: 40 },
    { name: "Mar", predictions: 45, fires: 35 },
    { name: "Apr", predictions: 60, fires: 50 },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        darkMode ? "bg-[#0b1220] text-white" : "bg-[#EAEBD0] text-black"
      }`}
    >
    

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6 mt-8 max-w-6xl mx-auto px-4">
        <Card
          title="Single Prediction"
          to="/predict"
          color="#CD5656"
          img="Files/Sinf.png"
        />
        <Card
          title="Realtime Monitoring"
          to="/realtime"
          color="#AF3E3E"
          img="Files/rlfire.png"
        />
      </div>

      {/* Recent Activity + News */}
      <div className="max-w-6xl mx-auto mt-12 px-4">
        <h2 className="text-xl font-bold mb-4">Recent Activity & News</h2>
        <ul
          className={`p-4 rounded-lg shadow space-y-3 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          {activity.map((item, i) => (
            <li
              key={i}
              className="flex justify-between items-center text-sm md:text-base"
            >
              <span>{item.log}</span>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Read more →
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Reports Section */}
      <div className="max-w-6xl mx-auto mt-12 px-4">
        <h2 className="text-xl font-bold mb-4">Reports & Analytics</h2>
        <div
          className={`p-4 rounded-lg shadow ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="predictions"
                stroke="#CD5656"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="fires"
                stroke="#AF3E3E"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
