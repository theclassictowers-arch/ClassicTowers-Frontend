// @ts-nocheck
import { useMemo } from "react";

export const DEFAULT_TOWER_PARAMETERS = [
  "vibrationRollAngle",
  "vibrationPitchAngle",
  "vibrationAngle",
  "vibrationSpeed",
  "windSpeed",
  "windDirection",
];

export const labelMapping: Record<string, string> = {
  vibrationAngle: "Yaw Angle",
  vibrationDisplacement: "Vibration Displacement",
  vibrationFrequency: "Vibration Frequency",
  vibrationRollAngle: "Vibration Roll Angle",
  vibrationPitchAngle: "Vibration Pitch Angle",
  vibrationSpeed: "Vibration Speed",
  windSpeed: "Wind Speed",
  windDirection: "Wind Direction",
  windHumidity: "Humidity",
  windTemperature: "Temperature",
};

export const trendColors = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#ca8a04",
  "#db2777",
  "#4f46e5",
  "#059669",
];

const toNumericValue = (value: any) => {
  const numericValue = parseFloat(value);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

export const useSensorVisualizationData = ({
  sensorData,
  sensorParameters,
}: {
  sensorData: any;
  sensorParameters: string[];
}) => {
  const rawDataArray = useMemo(
    () => (Array.isArray(sensorData) ? sensorData : [sensorData]),
    [sensorData]
  );
  const limits = rawDataArray[0]?.limits;
  const allProcessedData = useMemo(
    () => rawDataArray.flatMap((item) => item?.processedSensorData || []),
    [rawDataArray]
  );

  const sensorDataForGraphs = useMemo(
    () =>
      allProcessedData?.map((data: any) => {
        const timestamp = data.createdAt || `${data.date}T${data.time}Z`;
        const dateObj = new Date(timestamp);
        const formattedTime = dateObj.toLocaleTimeString("en-GB", {
          hour12: false,
        });

        return {
          ...data,
          date: data.date,
          time: formattedTime,
        };
      }),
    [allProcessedData]
  );

  const unifiedChartData = useMemo(() => {
    const timeMap: Record<string, any> = {};

    sensorDataForGraphs?.forEach((item: any) => {
      const timeKey = `${item.date} ${item.time}`;
      if (!timeMap[timeKey]) {
        timeMap[timeKey] = { date: item.date, time: item.time };
      }

      const paramKey = item.parameter || "unknown";
      const singleValue = toNumericValue(item.value);

      if (singleValue !== undefined) {
        timeMap[timeKey][paramKey] = singleValue;
      } else {
        (["x", "y", "z"] as const).forEach((axis) => {
          const axisValue = toNumericValue(item[axis]);
          if (axisValue !== undefined) {
            timeMap[timeKey][`${paramKey}_${axis}`] = axisValue;
          }
        });
      }
    });

    return Object.values(timeMap).sort((a: any, b: any) =>
      `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
    );
  }, [sensorDataForGraphs]);

  const selectedTrendKeys = useMemo(() => {
    let colorIndex = 0;

    return sensorParameters.flatMap((param) => {
      const samples = sensorDataForGraphs?.filter(
        (data: any) => data.parameter === param
      );
      const label = labelMapping[param] || param;
      const getNextColor = () => trendColors[colorIndex++ % trendColors.length];
      const hasSingleValue = samples?.some(
        (data: any) => toNumericValue(data.value) !== undefined
      );
      const availableAxes = (["x", "y", "z"] as const).filter((axis) =>
        samples?.some((data: any) => toNumericValue(data[axis]) !== undefined)
      );

      if (hasSingleValue || availableAxes.length === 0) {
        return [{ key: param, color: getNextColor(), label }];
      }

      return availableAxes.map((axis) => ({
        key: `${param}_${axis}`,
        color: getNextColor(),
        label: `${label} (${axis.toUpperCase()})`,
      }));
    });
  }, [sensorDataForGraphs, sensorParameters]);

  const latestAngles = useMemo(() => {
    const latest = [...unifiedChartData]
      .reverse()
      .find((item: any) =>
        [
          "vibrationRollAngle",
          "vibrationPitchAngle",
          "vibrationAngle",
          "windSpeed",
          "windDirection",
          "vibrationSpeed_x",
          "vibrationSpeed_y",
          "vibrationSpeed_z",
        ].some((key) => typeof item[key] === "number")
      ) as any;

    const vibrationValues = [
      latest?.vibrationSpeed_x,
      latest?.vibrationSpeed_y,
      latest?.vibrationSpeed_z,
    ].filter((value) => typeof value === "number");

    return {
      roll: latest?.vibrationRollAngle,
      pitch: latest?.vibrationPitchAngle,
      yaw: latest?.vibrationAngle,
      windSpeed: latest?.windSpeed,
      windDirection: latest?.windDirection,
      vibration:
        vibrationValues.length > 0
          ? vibrationValues.reduce((total, value) => total + Math.abs(value), 0) /
            vibrationValues.length
          : undefined,
    };
  }, [unifiedChartData]);

  return {
    limits,
    unifiedChartData,
    selectedTrendKeys,
    latestAngles,
  };
};
