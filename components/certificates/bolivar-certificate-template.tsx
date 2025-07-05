"use client";

import { formatDateCert } from "@/lib/utils";
import {
  Document,
  Page,
  Text,
  StyleSheet,
  View,
  Image,
  Font,
  Link,
  PDFDownloadLink,
} from "@react-pdf/renderer";

Font.register({
  family: "Roboto Condensed",
  fonts: [
    {
      src: "/font/RobotoCondensed-Bold.ttf",
      fontWeight: "bold",
    },
    {
      src: "/font/RobotoCondensed-Regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "/font/RobotoCondensed-SemiBold.ttf",
      fontWeight: "semibold",
    },
    {
      src: "/font/RobotoCondensed-SemiBoldItalic.ttf",
      fontWeight: "semibold",
      fontStyle: "italic",
    },
    {
      src: "/font/RobotoCondensed-Light.ttf",
      fontWeight: "light",
    },
    {
      src: "/font/RobotoCondensed-Medium.ttf",
      fontWeight: "medium",
    },
  ],
});

interface CertificateTemplateProps {
  collaboratorName?: string | null;
  collaboratorDoc?: string | null;
  endDate?: Date ;
  collaboratorByArl?: Boolean;
  city?: string | null;
}

export const BolivarCertificateTemplate = ({
  collaboratorName,
  collaboratorDoc,
  endDate,
  collaboratorByArl,
  city,
}: CertificateTemplateProps) => {

  const dateParse = endDate ? new Date(endDate) : null

  const numberWithCommas = (num: string) => {
    // Verifica si number es una cadena de texto y conviértela a número
    let number: number = 0;
    if (typeof num === 'string' && num !== "") {
      number = parseFloat(num);
    }
    return number ? number.toLocaleString() : ""
  };

  return (
    <Document style={{ height: "100%", width: "100%" }}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
          }}
        >
          <Image
            src={`/back-bol.jpg`}
            style={{ width: "100%", height: "100%" }}
          />
        </View>

        <View
          style={{
            width: "70%",
            height: "80%",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            marginHorizontal: "auto",
            marginTop: "50px",
            gap: "10px",
          }}
        >
          <Image
            src={`/arl-bolivar.png`}
            style={{ width: "165px", height: "32px" }}
          />
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "9px",
              alignItems: "center",
              marginTop: "15px",
            }}
          >
            <Text
              style={{
                fontWeight: "bold",
                fontSize: "20px",
                color: "#016d38",
                letterSpacing: "5px",
              }}
            >
              SEGUROS BOLÍVAR
            </Text>
            <View
              style={{
                position: "relative",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                src={`/band-yellow.png`}
                style={{ width: "300px", height: "25px", position: "absolute" }}
              />
              <Text
                style={{
                  fontSize: "17px",
                  fontWeight: "semibold",
                  letterSpacing: "5px",
                  color: "#595959",
                  marginTop: "2px",
                }}
              >
                CERTIFICA QUE
              </Text>
            </View>

            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1px",
              }}
            >
              <Text
                style={{
                  fontSize: "25px",
                  fontWeight: "semibold",
                  fontStyle: "italic",
                  color: "#595959",
                  textTransform: "uppercase",
                }}
              >
                {collaboratorName}
              </Text>
              <Text
                style={{
                  fontSize: "25px",
                  fontWeight: "semibold",
                  fontStyle: "italic",
                  color: "#595959",
                }}
              >
                {numberWithCommas(collaboratorDoc || "")}
              </Text>
            </View>
          </View>
          <View
            style={{
              height: "20px",
              width: "100%",
              borderBottom: "2px dotted #d8d8d8",
            }}
          />
          <View
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "7px",
              marginBottom: "25px",
            }}
          >
            <Text style={{ fontSize: "13px", color: "#595959" }}>
              Recibió capacitación en Formación y Entrenamiento Seguridad
              Eléctrica con una intensidad de (4) horas,
            </Text>
            <Text style={{ fontSize: "13px", color: "#595959" }}>
              realizado en{" "}
              {(city === "Virtual" ) ? "modalidad virtual" : `la ciudad de ${city}`} el{" "}
              <Text style={{ fontWeight: "bold" }}>
               {dateParse ? formatDateCert(dateParse) : ""}
              </Text>
            </Text>
            <Text style={{ fontSize: "13px", color: "#595959" }}>
              Cumpliendo los Requerimientos de la Resolución 5018 de 2019 y
              40293 de 2021
            </Text>
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "90%",
              marginTop: "45px",
              marginRight: "25px",
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "7px",
                color: "#595959",
                fontSize: "14px",
                fontWeight: "bold",
                fontStyle: "italic",
              }}
            >
                <Image
                  style={{
                    width: 130,
                    height: 37,
                    position: "absolute",
                    top: -32,
                    left: 37,
                  }}
                  src={`/jose-firma2.png`}
                />
              <Text style={{ color: "#595959" }}>JOSE CRISTANCHO DURAN</Text>
            
              <Text>Grupo HSEQ Consultoría En Gestión</Text>
              <Text>Integral De Riesgo</Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "7px",
                color: "#595959",
                fontSize: "14px",
                fontWeight: "bold",
                fontStyle: "italic",
              }}
            >
              <Text style={{textTransform: "uppercase"}}>Olga Cecilia Hernández</Text>
              <Text>Subgerente Nacional de Prevención y Bienestar</Text>
              <Text>Empresarial</Text>
            </View>
          </View>
        </View>
        <Image
          src={`/boton-certificacion.png`}
          style={{
            width: "120px",
            height: "160px",
            position: "absolute",
            bottom: 45,
            right: 15,
          }}
        />
      </Page>
    </Document>
  );
};
const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto Condensed",
    backgroundColor: "#fff",
    padding: 0,
    marginHorizontal: "auto",
  },
});
