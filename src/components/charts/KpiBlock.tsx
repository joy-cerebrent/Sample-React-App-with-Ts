// App.tsx or another component file
import React, { useEffect, useState } from "react";
import { StatCard } from "utility-package";
import { api_base_url } from "../../constants/globals";


const KpiBlock = () => {
  const [reports, setReports] = useState<any[]>([]);
  const GetReports = async () => {
    try {

      const response = await fetch(
        api_base_url + "/Kpi/KpiComponents",
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const { result: reportsResult } = await response.json();

      const updatedComponents = reportsResult
        .map((rpt: any) => {
          let value = 0;
          if (rpt.data && rpt.data.length == 1) {
            value = Object.values(rpt.data[0])[0];
          } else {
            return null;
          }
          return { ...rpt, value };
        })
        .filter((item) => item !== null);
      setReports(updatedComponents);
    } catch (error) {
      console.error("Error generating components:", error);
    } finally {
    }
  };

  useEffect(() => {
    GetReports();
  }, []);

  return (
    <div className="grid gap-4 grid-cols-12">
      <React.Fragment>
        {reports.map((stat: any, i: number) => (
          <StatCard
            key={i}
            title={stat.title}
            value={stat.value}
            pillText={stat.pillText}
            trend={stat.trend}
            period={stat.period}
            cols={4}
          />
        ))}
      </React.Fragment>
    </div>
  );
};

export default KpiBlock;
