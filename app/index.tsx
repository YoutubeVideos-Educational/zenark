import RenderItem from "@/components/RenderItem";
import { SliderData } from "@/constants/SliderData";
import { Colors } from "@/Styles/GlobalColors";
import { useRouter } from "expo-router";
import { useState } from "react";
import AppIntroSlider from "react-native-app-intro-slider";

const router = useRouter();

export default function Index() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSlideChange = (index: number) => {
    setCurrentIndex(index);
    if (index === SliderData.length - 1) {
      setTimeout(() => {
        router.push("/Login");
      }, 500); 
    }
  };

  return (
    <AppIntroSlider
      data={SliderData}
      renderItem={RenderItem}
      onDone={() => router.push("/Login")}
      onSlideChange={handleSlideChange}
      dotStyle={{
        backgroundColor: Colors.primaryDotColor,
        opacity: 0.6,
      }}
      activeDotStyle={{
        backgroundColor: Colors.primaryDotColor,
        opacity: 1,
      }}
      showNextButton={false}
      showDoneButton={false} // hide Done button as it's auto
      style={{ width: "100%", flex: 1, height: "100%" }}
    />
  );
}
