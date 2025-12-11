import BackIcon from "@/assets/icons/back.svg";
import { db } from "@/config/firebaseConfig";
import { useTheme } from "@/contexts/themeContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import ImageViewing from "react-native-image-viewing";

// Calculate image size for grid
const { width } = Dimensions.get("window");
const IMAGE_SIZE = width / 3;

const ChatGalleryScreen = () => {
    const router = useRouter();
    const { roomId } = useLocalSearchParams();
    const { colors } = useTheme();
    const styles = getStyles(colors);

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);

    // States for Image Viewer
    const [isViewerVisible, setIsViewerVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetchImages();
    }, [roomId]);

    const fetchImages = async () => {
        if (!roomId) return;
        try {
            const msgsRef = collection(db, "chats", roomId, "messages");
            // Fetch images ordered by creation date
            const q = query(msgsRef, orderBy("createdAt", "desc"));

            const snapshot = await getDocs(q);
            const fetchedImages = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.image) {
                    fetchedImages.push({
                        id: doc.id,
                        uri: data.image,
                        createdAt: data.createdAt,
                    });
                }
            });

            setImages(fetchedImages);
        } catch (error) {
            console.error("Błąd pobierania zdjęć:", error);
        } finally {
            setLoading(false);
        }
    };

    const openViewer = (index) => {
        setCurrentImageIndex(index);
        setIsViewerVisible(true);
    };

    const renderItem = ({ item, index }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => openViewer(index)}
            style={styles.imageContainer}
        >
            <Image source={{ uri: item.uri }} style={styles.image} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <BackIcon width={35} height={25} color={colors.iconFill} fill={colors.iconFill} />
                </TouchableOpacity>
                <Text style={styles.title}>Multimedia</Text>
                <View style={{ width: 35 }} />
            </View>

            {/* Grid */}
            {loading ? (
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color={colors.button} />
                </View>
            ) : images.length === 0 ? (
                <View style={styles.centerContent}>
                    <Text style={styles.emptyText}>No photos yet</Text>
                </View>
            ) : (
                <FlatList
                    data={images}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    numColumns={3}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            {/* Full Screen Viewer */}
            <ImageViewing
                images={images}
                imageIndex={currentImageIndex}
                visible={isViewerVisible}
                onRequestClose={() => setIsViewerVisible(false)}
                FooterComponent={({ imageIndex }) => (
                    <View style={{ padding: 20, alignItems: "center" }}>
                        <Text style={{ color: "#FFF", fontSize: 16 }}>
                            {imageIndex + 1} / {images.length}
                        </Text>
                    </View>
                )}
            />
        </View>
    );
};

const getStyles = (colors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 50,
            marginBottom: 20,
            paddingHorizontal: 15,
        },
        title: {
            fontSize: 24,
            fontWeight: "bold",
            color: colors.title,
        },
        backBtn: {
            padding: 5,
        },
        imageContainer: {
            width: IMAGE_SIZE,
            height: IMAGE_SIZE,
            padding: 2,
        },
        image: {
            flex: 1,
            width: undefined,
            height: undefined,
            backgroundColor: colors.inputBackground,
        },
        centerContent: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },
        emptyText: {
            color: colors.placeholder,
            fontSize: 16,
        },
    });

export default ChatGalleryScreen;