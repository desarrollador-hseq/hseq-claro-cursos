"use client";

import { formatDateCert } from "@/lib/utils";
import { Certificate } from "@prisma/client";
import {
  Document,
  Page,
  Text,
  StyleSheet,
  View,
  Image,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "calibri",
  fonts: [
    {
      src: "/font/calibrii.ttf",
      fontStyle: "italic",
    },
    {
      src: "/font/calibri.ttf",
      fontWeight: 300,
    },
    {
      src: "/font/calibri.ttf",
      fontWeight: 400,
    },
    {
      src: "/font/calibrib.ttf",
      fontWeight: 500,
    },
    {
      src: "/font/calibrib.ttf",
      fontWeight: 600,
    },
    {
      src: "/font/calibrib.ttf",
      fontWeight: 700,
    },
  ],
});

interface CertificateTemplateProps {
 certificate: Certificate;
}

export const CertificateTemplate = ({
  certificate
}: CertificateTemplateProps) => {
 
  const colFullname = certificate.collaboratorFullname;
  const colDoc = certificate.collaboratorNumDoc;
  const courseName = certificate.courseName;
  const courseLevelName = certificate.levelName;
  const courseHours = certificate.levelHours || "---";
  const city = certificate.collaboratorCityName;
  const dateCert = certificate.startDate ? formatDateCert(new Date(certificate.startDate)) : "---";
  
 

  return (
    <Document style={{ height: "100%", width: "100%" }}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <View
            style={{
              height: "101%",
              backgroundColor: "#ff0000",
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: 45,
            }}
          />
          <Image
            style={{ width: 130, position: "absolute", top: 10, right: 20 }}
            src="/riesgo.png"
          />

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "90%",
              height: "90%",
              marginLeft: 55,
              marginRight: 10,
            }}
          >
            <View style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              {/* --------Title--------- */}
              <View
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: "30",
                }}
              >
                <Text style={{ fontSize: 36, fontWeight: "bold" }}>
                  COMUNICACIÓN CELULAR
                </Text>
                <Text style={{ fontSize: 36, fontWeight: "bold" }}>
                  COMCEL S.A.
                </Text>
                <Text style={{ fontSize: 15, marginTop: 12 }}>
                  Hace constar que:{" "}
                </Text>
              </View>

              {/* --------Nombres--------- */}
              <View
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 25,
                    fontWeight: "semibold",
                    textTransform: "uppercase",
                  }}
                >
                  {colFullname}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: "normal" }}>
                  Identificado con número de documento:
                </Text>
                <Text style={{ fontSize: 15 }}>{colDoc}</Text>
              </View>

              {/* --------Course--------- */}
              <View
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "normal",
                    marginBottom: 20,
                  }}
                >
                  Participó y aprobó la capacitación:
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#ff0000",
                    textTransform: "uppercase",
                  }}
                >
                  {courseName}
             
                </Text>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: "#ff0000" }}> Nivel: {courseLevelName}</Text>
                <Text
                  style={{ fontSize: 15, fontWeight: "bold", color: "#000000" }}
                >
                con duración de {courseHours} horas
                </Text>
              </View>
              {/* --------Date and Resolution--------- */}
              <View
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: 26,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  Cumpliendo los Requerimientos de la Resolución 5018 de 2019
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "normal",
                    marginTop: 20,
                  }}
                >
                  {city === "Virtual"
                    ? "Realizado en modalidad virtual,"
                    : `Realizado en ciudad de ${city},`}{" "}
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "semibold",
                      marginBottom: 5,
                    }}
                  >
                    el día {dateCert}
                  </Text>
                </Text>
              </View>
            </View>

            <Image
              style={{ height: "75%", alignSelf: "flex-end" }}
              src={`/user.png`}
            />
          </View>

          {/* -------- Signature --------- */}
          <View
            style={{
              width: "80%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              marginLeft: 30,
              marginBottom: 15,
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginLeft: 35,
                marginRight: 5,
                paddingTop: "5px",
              }}
            >
              <Text style={{ fontWeight: "semibold", fontSize: 13 }}>
                FERNANDO FORERO NAVARRETE
              </Text>
              <Text style={{ fontSize: 10 }}>JEFE SST&A</Text>
            </View>
            {/* --------------------------------------------------- */}
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                height: "100%",
              }}
            >
              <View>
                <Image
                  style={{
                    width: 100,
                    height: 35,
                    position: "absolute",
                    top: -32,
                    left: 50,
                  }}
                  src={`/jhonm.jpeg`}
                />
                <Text
                  style={{
                    fontWeight: "semibold",
                    fontSize: 13,
                  }}
                >
                  JOHN MERIÑO HERRÁN - Ing. Eléctrico.
                </Text>
              </View>
              <Text style={{ fontSize: 10, fontWeight: "semibold" }}>
                M. P AT205-178689
              </Text>
              <Text style={{ fontSize: 10, fontWeight: "semibold" }}></Text>
              <Text style={{ fontSize: 10 }}>Instructor</Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                height: "100%",
                paddingTop: "5px",
              }}
            >
              <View>
                <Image
                  style={{
                    width: 80,
                    height: 38,
                    position: "absolute",
                    top: -35,
                    left: 60,
                  }}
                  src={`/yehidert-2.png`}
                />
                <Text
                  style={{
                    fontWeight: "semibold",
                    fontSize: 13,
                  }}
                >
                  YEHIDERT GARIZABALO MENDOZA
                </Text>
              </View>
              <Text style={{ fontSize: 10, fontWeight: "semibold" }}>
                Licencia SST 0797 DE 2019
              </Text>
              <Text style={{ fontSize: 10, fontWeight: "semibold" }}>
                HSEQ-CGIR SAS Licencia SST 560 DE 2023
              </Text>
              <Text style={{ fontSize: 10 }}>
                Jefe Operativo - Líder de formación.
              </Text>
            </View>
          </View>
          {/* -------- Footer --------- */}
          <View
            style={{
              width: "88%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "flex-start",
              marginLeft: 40,
              marginRight: 80,
            }}
          >
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: 10,
                justifyContent: "flex-start",
              }}
            >
              <Image
                style={{
                  width: 125,
                  height: 42,
                  marginBottom: 20,
                  marginLeft: 10,
                }}
                src={`/ssta.png`}
              />
            </View>
            {/* --------------------------------------------------- */}
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 12, color: "000000", fontStyle: "italic" }}
              >
                La autenticidad de este documento puede ser consultado a través
                del área de seguridad, salud y ambiente (SST&A)
              </Text>
              <Text
                style={{ fontSize: 12, color: "000000", fontStyle: "italic" }}
              >
                correo seguridadeneltrabajo@claro.com.co
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
const styles = StyleSheet.create({
  page: {
    fontFamily: "calibri",
    backgroundColor: "#fff",
    padding: 0,
    marginHorizontal: "auto",
  },
});
