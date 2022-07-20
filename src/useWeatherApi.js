// STEP 1：載入會用到的 React Hooks
import { useState, useEffect, useCallback } from "react";

// STEP 1：定義 fetchCurrentWeather 方法，並呼叫中央氣象局 API
const fetchCurrentWeather = () => {
  // 向 requestURL 發送請求
  return (
    fetch(
      "https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-61557089-848B-404B-9766-670D82974E08&locationName=臺北"
    )
      // 取得伺服器回傳的資料並以 JSON 解析
      .then((response) => response.json())
      // 取得解析後的 JSON 資料
      .then((data) => {
        const locationData = data.records.location[0];
        const weatherElements = locationData.weatherElement.reduce(
          (neededElements, item) => {
            if (["WDSD", "TEMP", "HUMD"].includes(item.elementName)) {
              neededElements[item.elementName] = item.elementValue;
            }
            return neededElements;
          },
          {}
        );
        // STEP 3-2：把取得的資料內容回傳出去，而不是在這裡 setWeatherElement
        return {
          observationTime: locationData.time.obsTime,
          locationName: locationData.locationName,
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
          humid: weatherElements.HUMD
        };
      })
  );
};

const fetchWeatherForecast = () => {
  // STEP 4-1：修改函式，把 fetch API 回傳的 Promise 直接回傳出去
  return fetch(
    "https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=CWB-61557089-848B-404B-9766-670D82974E08&locationName=臺北市"
  )
    .then((response) => response.json())
    .then((data) => {
      const locationData = data.records.location[0];
      const weatherElements = locationData.weatherElement.reduce(
        (neededElements, item) => {
          if (["Wx", "PoP", "CI"].includes(item.elementName)) {
            neededElements[item.elementName] = item.time[0].parameter;
          }
          return neededElements;
        },
        {}
      );
      // STEP 4-2：把取得的資料內容回傳出去，而不是在這裡 setWeatherElement
      return {
        description: weatherElements.Wx.parameterName,
        weatherCode: weatherElements.Wx.parameterValue,
        rainPossibility: weatherElements.PoP.parameterName,
        comfortability: weatherElements.CI.parameterName
      };
    });
};

const useWeatherApi = () => {
  const [weatherElement, setWeatherElement] = useState({
    observationTime: new Date(),
    locationName: "",
    humid: 0,
    temperature: 0,
    windSpeed: 0,
    description: "",
    weatherCode: 0,
    rainPossibility: 0,
    comfortability: "",
    isLoading: true
  });

  const fetchData = useCallback(() => {
    const fetchingData = async () => {
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(),
        fetchWeatherForecast()
      ]);

      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        isLoading: false
      });
    };

    setWeatherElement((prevState) => ({
      ...prevState,
      isLoading: true
    }));

    fetchingData();
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return [weatherElement, fetchData];
};
export default useWeatherApi;
