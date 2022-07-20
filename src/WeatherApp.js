//STEP 1：載入 useState，載入 useEffect
import React, { useState, useEffect, useCallback, useMemo } from "react";
// STEP 1：載入 emotion 的 styled 套件
import styled from "@emotion/styled";
//日出日落的時間
import sunriseAndSunsetData from "./sunrise-sunset.json";
// STEP 1：從 emotion-theming 中載入 ThemeProvider
import { ThemeProvider } from "@emotion/react";
import WeatherCard from "./WeatherCard";
import useWeatherApi from "./useWeatherApi";
// STEP 1：匯入 WeatherSetting
import WeatherSetting from "./WeatherSetting";

//定義配色主題
const theme = {
  light: {
    backgroundColor: "#ededed",
    foregroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px 0 #999999",
    titleColor: "#212121",
    temperatureColor: "#757575",
    textColor: "#828282"
  },
  dark: {
    backgroundColor: "#1F2022",
    foregroundColor: "#121416",
    boxShadow:
      "0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)",
    titleColor: "#f9f9fa",
    temperatureColor: "#dddddd",
    textColor: "#cccccc"
  }
};

// STEP 2：定義帶有 styled 的 compoment
const Container = styled.div`
  /* STEP 3：在 Styled Component 中可以透過 Props 取得對的顏色 */
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const getMoment = (locationName) => {
  // STEP 2：從日出日落時間中找出符合的地區
  const location = sunriseAndSunsetData.find(
    (data) => data.locationName === locationName
  );
  // STEP 3：找不到的話則回傳 null
  if (!location) return null;
  // STEP 4：取得當前時間
  const now = new Date();
  // STEP 5：將當前時間以 "2019-10-08" 的時間格式呈現
  const nowDate = Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .format(now)
    .replace(/\//g, "-");
  // STEP 6：從該地區中找到對應的日期
  const locationDate =
    location.time && location.time.find((time) => time.dataTime === nowDate);

  // STEP 7：將日出日落以及當前時間轉成時間戳記（TimeStamp）
  const sunriseTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunrise}`
  ).getTime();
  const sunsetTimestamp = new Date(
    `${locationDate.dataTime} ${locationDate.sunset}`
  ).getTime();
  const nowTimeStamp = now.getTime();

  // STEP 8：若當前時間介於日出和日落中間，則表示為白天，否則為晚上
  return sunriseTimestamp <= nowTimeStamp && nowTimeStamp <= sunsetTimestamp
    ? "day"
    : "night";
};

const WeatherApp = () => {
  const [currentPage, setCurrentPage] = useState("WeatherCard");
  const [weatherElement, fetchData] = useWeatherApi();
  const [currentTheme, setCurrentTheme] = useState("light");
  const { locationName } = weatherElement;

  // STEP 3：透過 useMemo 避免每次都須重新計算取值，記得帶入 dependencies
  const moment = useMemo(() => getMoment(locationName), [locationName]);

  // 根據 moment 決定要使用亮色或暗色主題
  useEffect(() => {
    setCurrentTheme(moment === "day" ? "light" : "dark");
    // 記得把 moment 放入 dependencies 中
  }, [moment]);

  return (
    // STEP 2：把所有會用到主題配色的部分都包在 ThemeProvider 內
    // STEP 3：透過 theme 這個 props 傳入深色主題
    <ThemeProvider theme={theme[currentTheme]}>
      {/* STEP 4：把原本寫在 Container 內的 props 移除 */}
      <Container>
        {/* STEP 2：利用條件渲染的方式決定要呈現哪個組件 */}
        {currentPage === "WeatherCard" && (
          <WeatherCard
            weatherElement={weatherElement}
            moment={moment}
            fetchData={fetchData}
            setCurrentPage={setCurrentPage}
          />
        )}
        {currentPage === "WeatherSetting" && (
          <WeatherSetting setCurrentPage={setCurrentPage} />
        )}
      </Container>
    </ThemeProvider>
  );
};

export default WeatherApp;
