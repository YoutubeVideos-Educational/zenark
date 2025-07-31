import { Colors } from "@/Styles/GlobalColors";
import React from "react";
import { Image, StatusBar, Text, View } from "react-native";

interface ItemProps {
  title: string;
  description: string;
  background_color: string;
  id: number;
  imageUrl: string;
}

// Define the imageMap with an index signature
const imageMap: { [key: string]: any } = {
  image1: require("../assets/images/image1.png"),
  image2: require("../assets/images/image2.png"),
  image3: require("../assets/images/image3.png"),
};

const RenderItem = ({ item }: { item: ItemProps }) => {
  return (
    <View
      style={{
        backgroundColor: Colors.whiteColor,
        width: "100%",
        flex: 1,
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 24,
      }}
    >
      {/* Set StatusBar color dynamically */}
      <StatusBar backgroundColor={item.background_color} barStyle="light-content" />

      <Image
        source={imageMap[item.imageUrl]} 
        style={{
          width: "100%",
          height: 350,
          borderRadius: 40,
          resizeMode: "contain",
          overflow: "hidden",
        }}
      />
      <View
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "black",
            marginTop: 10,
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: "#000000",
            textAlign: "center",
            opacity:0.6,
            width:"90%",
            marginHorizontal:"auto"
          }}
        >
          {item.description}
        </Text>
      </View>
    </View>
  );
};

export default RenderItem;