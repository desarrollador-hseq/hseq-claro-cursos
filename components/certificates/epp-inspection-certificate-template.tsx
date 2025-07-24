"use client";

import { formatDate, formatDateCert } from "@/lib/utils";
import {
  EppCertificationInspection,
  EppInspectionDetail,
  EppType,
} from "@prisma/client";
import {
  Document,
  Page,
  Text,
  StyleSheet,
  View,
  Font,
  Image,
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

interface EppInspectionCertificateProps {
  eppInspection:
    | (EppCertificationInspection & {
        inspectionDetails: EppInspectionDetail[];
      })
    | null;
}

const getEppName = (eppType: EppType | "") => {
  switch (eppType) {
    case "ARNES_CUERPO_COMPLETO":
      return "ARNES CUERPO COMPLETO";
    case "ESLINGA_DOBLE_TERMINAL_EN_Y":
      return "ESLINGA DOBLE TERMINAL EN Y";
    case "ESLINGA_POSICIONAMIENTO":
      return "ESLINGA POSICIONAMIENTO";
    case "FRENO_ARRESTADOR_CABLE":
      return "FRENO ARRESTADOR CABLE";
    case "MOSQUETON":
      return "MOSQUETON";
    case "ANCLAJE_TIPO_TIE_OFF":
      return "ANCLAJE TIPO TIE OFF";
    default:
      return "-";
  }
}

export const EppInspectionCertificateTemplate = ({
  eppInspection,
}: EppInspectionCertificateProps) => {
  const COMPANY_NAME = "CLARO S.A.S";
  const inspectionDate = formatDate(eppInspection?.inspectionDate);
  const certificationDate = formatDate(eppInspection?.certificationDate, "dd/MM/yyyy");
  const collaboratorName = eppInspection?.collaboratorName || "-";
  const eppType = eppInspection?.eppType || "";
  const eppName = eppInspection?.eppName || "-";
  const eppSerialNumber = eppInspection?.eppSerialNumber || "-";
  const eppBrand = eppInspection?.eppBrand || "-";
  const eppModel = eppInspection?.eppModel || "-";
  const manufacturingDate = formatDate(eppInspection?.manufacturingDate);
  const validationNotes = eppInspection?.validationNotes || "";
  const isSuitable = eppInspection?.isSuitable ? "SI" : "NO";

  const inspectionSummary = eppInspection?.inspectionSummary as any;
  const eppCategories = inspectionSummary?.categories || [];

  // Extraer las categorías y respuestas desde el formato [{"Categoria": "Respuesta"}]
  const categoryNames = eppCategories.map((cat: any) => Object.keys(cat)[0]);
  const categoryAnswers = eppCategories.map(
    (cat: any) => Object.values(cat)[0]
  );

  console.log({ eppCategories, eppInspection });

  return (
    <Document style={{ height: "100%", width: "100%" }}>
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.mainContainer}>
          {/* Nueva cabecera tipo imagen */}
          <View style={styles.headerRow}>
            <View style={styles.headerLogoBox}>
              <Image
                src="/logo-grupohseq.png"
                style={{ width: 70, height: 35 }}
              />
            </View>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerMainTitle}>HSEQ – CGIR S. A. S.</Text>
              <Text style={styles.headerSubtitle}>
                CONSULTORIA EN GESTION INTEGRAL DE RIESGOS
              </Text>
            </View>
            <View style={styles.headerCertBox}>
              <View style={styles.headerCertNumberBox}>
                <Text style={styles.headerCertNumberLabel}>CERTIFICADO </Text>
                <Text style={styles.headerCertNumber}>
                No {eppInspection?.certificateNumber || "-----"}
                </Text>
              </View>
            </View>
          </View>

          <View style={{...styles.infoRowBlock, borderLeft: "1px solid #333333", borderRight: "1px solid #333333"}}>
            <Text style={styles.infoBlockTitle}>CERTIFICADO</Text>
            <Text style={styles.infoBlockCode}>FOR-HSEQ-CGIR-155</Text>
          </View>

          <View
            style={{ flexDirection: "row", borderBottom: "1px solid #333333" }}
          >
            <View
              style={{
                width: "75%",
                borderRight: "1px solid #333333",

                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                paddingTop: 4,
                paddingLeft: 6,
                borderLeft: "1px solid #333333",
              }}
            >
              <Text style={styles.infoBlockLabel}>Denominación:</Text>
              <Text style={styles.infoBlockDenom}>
                Inspección de equipos y elementos para trabajo seguro en alturas
              </Text>
            </View>
            <View style={{...styles.headerCertRow, borderRight: "1px solid #333333"}}>
              <View
                style={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 2,
                  width: "60%",
                  borderRight: "1px solid #333333",
                }}
              >
                <Text style={styles.headerCertSmall}>Emisión: {certificationDate}</Text>
                <Text style={styles.headerCertSmall}>Revisión:</Text>
              </View>
              <View
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40%",
                
                }}
              >
                <Text style={{ ...styles.headerCertSmall, fontWeight: 700 }}>
                  Versión: 01
                </Text>
              </View>
            </View>
          </View>
          {/* Bloque de datos principales */}
          <View style={{ padding: 10 }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                paddingVertical: 10,

                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: "50%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 5,
                }}
              >
                <View style={styles.infoRowBlock}>
                  <Text style={styles.infoBlockLabel}>EMPRESA USUARIA:</Text>
                  <View style={styles.infoBlockInput}>
                    <Text style={styles.infoBlockInputText}>
                      {COMPANY_NAME}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoRowBlock}>
                  <Text style={styles.infoBlockLabel}>COLABORADOR:</Text>
                  <View style={styles.infoBlockInput}>
                    <Text style={styles.infoBlockInputText}>
                      {eppInspection?.collaboratorName}
                    </Text>
                  </View>
                </View>
                
              </View>
              <View
                style={{
                  width: "50%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <View style={styles.infoRowBlock}>
                  <Text style={{ ...styles.infoBlockLabel }}>
                    FECHA DE INSPECCIÓN:
                  </Text>
                  <View style={styles.infoBlockInput}>
                    <Text style={styles.infoBlockInputText}>
                      {inspectionDate?.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.infoRowBlock}>
                  <Text style={styles.infoBlockLabel}>
                    INSPECTOR:
                  </Text>
                  <View style={styles.infoBlockInput}>
                    <Text style={styles.infoBlockInputText}>
                      {eppInspection?.inspectorName}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Element Description Table */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                1. DESCRIPCIÓN DEL ELEMENTO / EQUIPO
              </Text>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableRow}>
                  <View style={[styles.tableHeader, styles.column1]}>
                    <Text style={styles.tableHeaderText}>TIPO DE ELEMENTO</Text>
                  </View>
                  <View style={[styles.tableHeader, styles.column2]}>
                    <Text style={styles.tableHeaderText}>FABRICANTE</Text>
                  </View>
                  <View style={[styles.tableHeader, styles.column2]}>
                    <Text style={styles.tableHeaderText}>
                      REFERENCIA/SERIAL
                    </Text>
                  </View>
                  <View style={[styles.tableHeader, styles.column2]}>
                    <Text style={styles.tableHeaderText}>
                      FECHA MANUFACTURA
                    </Text>
                  </View>
                </View>
                {/* Table Content */}
                <View style={styles.tableRow}>
                  <View style={[styles.tableCell, styles.column1]}>
                    <Text style={styles.tableCellBoldText}>{getEppName(eppType)}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.column2]}>
                    <Text style={styles.tableCellText}>{eppBrand}</Text>
                  </View>
                  <View style={[styles.tableCell, styles.column2]}>
                    <Text style={styles.tableCellText}>
                      {eppSerialNumber}
                    </Text>
                  </View>
                  <View style={[styles.tableCell, styles.column2]}>
                    <Text style={styles.tableCellText}>
                      {manufacturingDate || "NO DESCRIBE"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Component Verification */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                2. VERIFICACIÓN DE LOS COMPONENTES DEL ELEMENTO/EQUIPO (B:
                Bueno, M: Malo, NA: No aplica)
              </Text>
              <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableRow}>
                  {categoryNames?.map((category: string, index: number) => (
                    <View
                      key={index}
                      style={[styles.tableHeader, styles.column1]}
                    >
                      <Text style={styles.tableHeaderText}>{category}</Text>
                    </View>
                  ))}
                </View>
                {/* Table Content */}
                <View style={styles.tableRow}>
                  {categoryAnswers?.map((response: any, index: number) => (
                    <View
                      key={index}
                      style={[styles.tableCell, styles.column1]}
                    >
                      <Text style={styles.tableCellBoldText}>{response}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Improvement Aspect */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>3. ASPECTO POR MEJORAR</Text>
              <View style={styles.textBox}>
                <Text style={styles.normalText}>
                  {eppInspection?.observations || "-"}
                </Text>
              </View>
            </View>

            {/* Determination */}
            <View style={styles.sectionContainer}>
              <View style={styles.determinationRow}>
                <View style={styles.determinationLeft}>
                  <Text style={styles.sectionTitle}>4. DETERMINACIÓN</Text>
                  <View style={{ display: "flex", flexDirection: "row" }}>
                    <View style={styles.determinationField}>
                      <Text style={styles.normalText}>CONTINUA EN SERVICIO:</Text>
                      <View style={styles.determinationBox}>
                        <Text style={styles.boldText}>{isSuitable}</Text>
                      </View>
                    </View>
                    {/* Justification */}
                    <View
                      style={{
                        width: "50%",
                        paddingLeft: 10,
                        
                      }}
                    >
                      <Text style={styles.boldText}>JUSTIFICACIÓN:</Text>
                      <View style={styles.textBox}>
                        <Text style={styles.normalText}>
                          {validationNotes || "-"}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* <View
              style={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
               
              }}
            >
              <View
                style={{
                  width: "70%",
                  padding: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <View style={styles.signatureBox}></View>
                <Text style={styles.boldText}>
                  FIRMA DEL INSPECTOR CERTIFICADO
                </Text>
              </View>
              <View
                style={{
                  width: "30%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Text style={styles.boldText}>QR</Text>
                <View
                  style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: "black",
                  }}
                ></View>
              </View>
            </View> */}
          </View>
        </View>
      </Page>
    </Document>
  );
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "calibri",
    // backgroundColor: "#fff",
    padding: 15,
    fontSize: 10,
  },

  mainContainer: {
    // border: "1px solid #333333",
    width: "100%",
    height: "100%",
    paddingVertical: 35,
  },
  // CABECERA
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    border: "1px solid #333333",
    padding: 4,
    // marginBottom: 2,
  },
  headerLogoBox: {
    width: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  headerMainTitle: {
    color: "#dc2626",
    fontWeight: 700,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 2,
  },
  headerSubtitle: {
    color: "#dc2626",
    fontWeight: 700,
    fontSize: 13,
    textAlign: "center",
  },
  headerCertBox: {
    minWidth: 180,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  headerCertRow: {
    flexDirection: "row",
    width: "25%",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerCertSmall: {
    fontSize: 10,
    marginLeft: 6,
  },
  headerCertNumberBox: {
    border: "1px solid #333333",
    padding: 3,
    alignItems: "center",
    minWidth: 90,

  },
  headerCertNumberLabel: {
    fontWeight: 700,
    fontSize: 10,
    textAlign: "center",
  },
  headerCertNumber: {
    fontWeight: 700,
    fontSize: 14,
    textAlign: "center",
  },
  // BLOQUE INFO PRINCIPAL
  infoBlock: {
    borderBottom: "1px solid #333333",
    padding: 8,
    
  },
  infoRowBlock: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: "auto",
    
  },
  infoBlockTitle: {
    fontWeight: 700,
    fontSize: 12,
    borderBottom: "1px solid #333333",
    borderRight: "1px solid #333333",
    width: "75%",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 2,
  },
  infoBlockCode: {
    fontWeight: 400,
    fontSize: 12,
    width: "25%",
    borderBottom: "1px solid #333333",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 2,
  },
  infoBlockLabel: {
    fontWeight: 700,
    fontSize: 10,
    width: "25%",
  },
  infoBlockDenom: {
    fontWeight: 700,
    fontSize: 12,
  },
  infoBlockInput: {
    borderRadius: 3,
    backgroundColor: "#e4e4e4",
    minWidth: 180,
    minHeight: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    paddingHorizontal: 4,
    flex: 1,
    width: "75%",
  },

  infoBlockInputText: {
    fontWeight: 700,
    fontSize: 10,
    textAlign: "center",
    textTransform: "uppercase",
  },
  // ESTILOS RESTANTES
  boldText: {
    fontWeight: 700,
    fontSize: 10,
  },
  normalText: {
    fontWeight: 400,
    fontSize: 11,
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 700,
    marginBottom: 5,
    fontSize: 10,
  },
  table: {
    width: "100%",
    borderBottom: "1px solid #333333",
    borderLeft: "1px solid #333333",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#e5e7eb",
    // borderLeft: "1px solid #333333",
    borderTop: "1px solid #333333",
    borderBottom: "1px solid #333333",
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  tableCell: {
     borderRight: "1px solid #333333",
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  column1: {
    flex: 1.2,
    borderRight: "1px solid #333333",
  },
  column2: {
    flex: 1,
    borderRight: "1px solid #333333",
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 700,
    textAlign: "center",
  },
  tableCellText: {
    fontSize: 9,
    textAlign: "center",
  },
  tableCellBoldText: {
    fontSize: 9,
    fontWeight: 700,
    textAlign: "center",
  },
  textBox: {
    borderRadius: 3,
    backgroundColor: "#e4e4e4",
    padding: 5,
    minHeight: 40,
    paddingVertical: 10,
  },
  determinationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  determinationLeft: {
    flex: 1,
  },
  determinationField: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    marginTop: 5,
    width: "30%",
    paddingLeft: 10,
  },
  determinationBox: {
    borderRadius: 3,
    backgroundColor: "#e4e4e4",
    padding: 5,
    minWidth: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  justificationBox: {
    border: "1px solid #333333",
    padding: 5,
  },

  signatureBox: {
    backgroundColor: "gray",
    width: 100,
    height: 60,
    marginTop: 2,
  },
});
