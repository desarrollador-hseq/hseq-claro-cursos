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
  certificate,
}: CertificateTemplateProps) => {
  console.log({ certificate });
  const colFullname = certificate.collaboratorFullname;
  const colDoc = certificate.collaboratorNumDoc;
  const courseName = certificate.courseName;
  const courseLevelName =
    certificate.levelName && certificate.levelName == certificate.courseName
      ? undefined
      : certificate.levelName;
  const courseHours = certificate.levelHours || "---";
  const city = certificate.collaboratorCityName;
  const dateCert = certificate.startDate
    ? formatDateCert(new Date(certificate.startDate))
    : "---";
  const coachName = certificate.coachName || "";
  const coachPosition = certificate.coachPosition || "ENTRENADOR";
  const coachLicense = certificate.coachLicence || "";
  const coachNumDoc = certificate.coachDoc || "";
  const startDate = certificate.startDate
    ? formatDateCert(new Date(certificate.startDate))
    : "---";
  const endDate = certificate.endDate
    ? formatDateCert(new Date(certificate.endDate))
    : "---";

  return (
    <Document style={{ height: "100%", width: "100%" }}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.container}>
          {/* Header con logos */}

          {/* Contenido principal */}
          <View style={styles.mainContent}>
            <View style={styles.header}>
              <Image style={styles.logoClaro} src="/logo-claro.png" />
              <Image style={styles.logoSsta} src="/ssta.png" />
            </View>
            {/* Lado izquierdo - Contenido del certificado */}
            <View style={styles.leftContent}>
              {/* Título principal */}
              <View style={styles.titleSection}>
                <Text style={styles.mainTitle}>
                  CERTIFICADO DE CAPACITACIÓN Y ENTRENAMIENTO PARA TRABAJO EN
                  ALTURA
                </Text>
              </View>

              {/* Información UVAE */}
              <View style={styles.uvaeSection}>
                <Text style={styles.uvaeText}>
                  LA UNIDAD VOCACIONAL DE APRENDIZAJE EN EMPRESA (UVAE) DE
                </Text>
                <Text style={styles.uvaeText}>COMUNICACIÓN</Text>
                <Text style={styles.uvaeText}>CELULAR COMCEL S.A.</Text>
                <Text style={styles.haceConstar}>Hace constar que:</Text>
              </View>

              {/* Nombre del colaborador */}
              <View style={styles.collaboratorSection}>
                <Text style={styles.collaboratorName}>{colFullname}</Text>
                <Text style={styles.documentText}>
                  Identificado con número de documento:{" "}
                  <Text style={styles.documentNumber}>{colDoc}</Text>
                </Text>
                <Text style={styles.courseParticipation}>
                  Participó y aprobó el curso de formación nivel:
                </Text>
              </View>

              {/* Información del curso */}
              <View style={styles.courseSection}>
                <Text style={styles.courseName}>
                  {courseLevelName ? courseLevelName : ""}
                </Text>
                <Text style={styles.courseName}>{courseName}</Text>
                <Text style={styles.courseLevel}>
                  INTENSIDAD {courseHours} HORAS
                </Text>
                <Text style={styles.arlText}>
                  ARL: {certificate.collaboratorArlName || "BOLÍVAR"}
                </Text>
              </View>

              {/* Información de cumplimiento */}
              <View style={styles.complianceSection}>
                <Text style={styles.complianceText}>
                  Cumpliendo los Requerimientos de la Resolución 4272 de 2021
                  del Ministerio del Trabajo
                </Text>
              </View>

              {/* Información de lugar y fecha */}
              <View style={styles.locationSection}>
                <Text style={styles.locationText}>
                  Realizado en <Text style={styles.bold}></Text> la ciudad de{" "}
                  <Text style={styles.bold}>{city || "BOGOTÁ"}</Text>
                </Text>
                <Text style={styles.dateText}>
                  del <Text style={styles.bold}>{startDate}</Text> al{" "}
                  <Text style={styles.bold}>{endDate}</Text>
                </Text>
                <Text style={styles.signatureLocation}>
                  En constancia se firma en {"BOGOTÁ"} el{" "}
                  <Text style={styles.bold}>{dateCert}</Text>
                </Text>
              </View>

              {/* Firmas */}
              <View style={styles.signaturesSection}>
                <View style={styles.signatureBlock}>
                  <View
                    style={{
                      width: 100,
                      height: 100,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {certificate.coachImgSignatureUrl && (
                      <Image
                        style={styles.signatureImage}
                        src={certificate.coachImgSignatureUrl || ""}
                      />
                    )}
                  </View>
                  <Text style={styles.signatureName}>{coachName}</Text>
                  <Text style={styles.signatureName}>{coachNumDoc}</Text>
                  <Text style={styles.signatureId}>{coachLicense}</Text>

                  <Text style={styles.signatureTitle}>{coachPosition}</Text>
                </View>

                <View style={styles.signatureBlock}>
                  <View
                    style={{
                      width: 100,
                      height: 100,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      style={{ width: "40%", height: "70%" }}
                      src={"/fernando-gonzalez.png"}
                    />
                  </View>
                  <Text style={styles.signatureName}>
                    FERNANDO GONZALEZ APANGO
                  </Text>
                  <Text style={styles.signatureId}>C.E. 306817</Text>
                  <Text style={styles.signatureTitle}>REPRESENTANTE LEGAL</Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  La autenticidad de este documento puede ser consultado a
                  través del área de seguridad, salud y ambiente (SST&A)de CLARO
                  a través del correo{" "}
                  <Text style={styles.emailLink}>
                    trabajoenalturas@claro.com.co
                  </Text>{" "}
                  con el siguiente consecutivo:{" "}
                  <Text style={styles.consecutive}>BOG2025RESC001381</Text>
                </Text>
              </View>
            </View>

            {/* Lado derecho - Imagen */}
          </View>
          <View style={styles.rightContent}>
            <Image style={styles.mainImage} src="/torre.png" />
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
  },
  container: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: "100%",
    padding: 0,
    position: "relative",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  logoClaro: {
    width: 80,
    height: 35,
    opacity: 0.3,
  },
  logoSsta: {
    width: 80,
    height: 40,
    opacity: 0.3,
  },
  mainContent: {
    flexDirection: "column",
    flex: 1,
    gap: 10,
    padding: 15,
  },
  leftContent: {
    flex: 1,
    paddingRight: 20,
  },
  rightContent: {
    width: 230,
    height: "100%",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
    color: "#000",
    lineHeight: 1.2,
  },
  uvaeSection: {
    alignItems: "center",
    marginBottom: 15,
  },
  uvaeText: {
    fontSize: 15,
    fontWeight: 600,
    textAlign: "center",
    color: "#000",
    lineHeight: 1.3,
  },
  haceConstar: {
    fontSize: 14,
    fontWeight: 400,
    textAlign: "center",
    color: "#000",
    marginTop: 8,
  },
  collaboratorSection: {
    alignItems: "center",
    marginBottom: 15,
  },
  collaboratorName: {
    fontSize: 24,
    fontWeight: 700,
    textAlign: "center",
    color: "#000",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  documentText: {
    fontSize: 14,
    fontWeight: 400,
    textAlign: "center",
    color: "#000",
    marginBottom: 4,
  },
  documentNumber: {
    fontSize: 16,
    fontWeight: 700,
  },
  courseParticipation: {
    fontSize: 14,
    fontWeight: 400,
    textAlign: "center",
    color: "#000",
    marginTop: 4,
  },
  courseSection: {
    alignItems: "center",
    marginBottom: 15,
  },
  courseName: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: "center",
    color: "#000",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  courseLevel: {
    fontSize: 14,
    fontWeight: 600,
    textAlign: "center",
    color: "#000",
    marginBottom: 4,
  },
  arlText: {
    fontSize: 14,
    fontWeight: 600,
    textAlign: "center",
    color: "#000",
  },
  complianceSection: {
    alignItems: "center",
    marginBottom: 5,
  },
  complianceText: {
    fontSize: 14,
    fontWeight: 600,
    textAlign: "center",
    color: "#000",
  },
  locationSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    fontWeight: 400,
    textAlign: "center",
    color: "#000",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    fontWeight: 400,
    textAlign: "center",
    color: "#000",
    marginBottom: 2,
    marginTop: 5,
  },
  signatureLocation: {
    fontSize: 12,
    fontWeight: 400,
    textAlign: "center",
    color: "#000",
    marginTop: 4,
  },
  bold: {
    fontWeight: 700,
  },
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
  footer: {
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 15,
  },
  footerText: {
    fontSize: 11,
    fontWeight: 400,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginBottom: 2,
  },
  footerEmail: {
    fontSize: 11,
    fontWeight: 400,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  emailLink: {
    color: "#0066cc",
  },
  consecutive: {
    fontWeight: 700,
    color: "#000",
  },
});
