"use client";

import { capitalizeFirstLetter } from "@/lib/utils";
import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

interface SignaturePreviewProps {
  name: string;
  position: string;
  licence?: string;
  imgSignatureUrl?: string | null;
}

Font.register({
  family: "Open Sans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf",
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-400.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-500.ttf",
      fontWeight: 500,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf",
      fontWeight: 600,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf",
      fontWeight: 700,
    },
  ],
});

export const SignaturePreview = ({
  name,
  position,
  licence,
  imgSignatureUrl,
}: SignaturePreviewProps) => {
  return (
    <Document style={{ height: "100%", width: "100%" }} language="es">
      <Page
        orientation="landscape"
        size="A7"
        style={{
          backgroundColor: "#fff",
          padding: 20,
          fontFamily: "Open Sans",
        }}
      >
        <View style={styles.signaturesSection}>
          <View style={styles.signatureBlock}>
            <View
              style={{
                width: 110,
                height: 80,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Image
                style={styles.signatureImage}
                src={imgSignatureUrl || ""}
              />
            </View>
            <Text style={styles.signatureName}>{name}</Text>
            <Text style={styles.signatureId}>{licence}</Text>
            <Text style={styles.signatureId}>{position}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

const styles = StyleSheet.create({
  signaturesSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  signatureBlock: {
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
  },
  signatureImage: {
    width: 100,
    height: 100,
    marginBottom: 2,
  },
  signatureName: {
    fontSize: 11,
    fontWeight: 700,
    textAlign: "center",
    color: "#000",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  signatureId: {
    fontSize: 11,
    fontWeight: 400,
    textAlign: "center",
    color: "#000",
    marginBottom: 1,
    textTransform: "uppercase",
  },
  signatureLicense: {
    fontSize: 11,
    fontWeight: 400,
    textAlign: "center",
    color: "#000",
    marginBottom: 1,
    textTransform: "uppercase",
  },
  signatureTitle: {
    fontSize: 11,
    fontWeight: 600,
    textAlign: "center",
    color: "#000",
    textTransform: "uppercase",
  },
});
