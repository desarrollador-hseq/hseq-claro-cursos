"use client";

import { Certificate, CetarCertificate, Course, CourseLevel } from "@prisma/client";
import { Chart } from "@/components/chart";

interface CertificateWithCourseLevel extends Certificate {
  courseLevel: CourseLevel & {
    course: Course;
  };
}

interface CetarCertificateWithCourseLevel extends CetarCertificate {
  courseLevel: CourseLevel & {
    course: Course;
  };
}

interface CertificatesByCourseProps {
  certificates: CertificateWithCourseLevel[];
  cetarCertificates: CetarCertificateWithCourseLevel[];
}

export const CertificatesByCourse = ({
  certificates,
  cetarCertificates,
}: CertificatesByCourseProps) => {
  const getCertificatesByCourse = () => {
    const courseData: { [courseName: string]: { regular: number; cetar: number; total: number } } = {};

    // Contar certificados regulares
    certificates.forEach(cert => {
      if (cert.active && cert.courseLevel?.course?.name) {
        const courseName = cert.courseLevel.course.name;
        if (!courseData[courseName]) {
          courseData[courseName] = { regular: 0, cetar: 0, total: 0 };
        }
        courseData[courseName].regular++;
        courseData[courseName].total++;
      }
    });

    // Contar certificados CETAR
    cetarCertificates.forEach(cert => {
      if (cert.active && cert.courseLevel?.course?.name) {
        const courseName = cert.courseLevel.course.name;
        if (!courseData[courseName]) {
          courseData[courseName] = { regular: 0, cetar: 0, total: 0 };
        }
        courseData[courseName].cetar++;
        courseData[courseName].total++;
      }
    });

    return courseData;
  };

  const courseData = getCertificatesByCourse();
  const sortedCourses = Object.entries(courseData)
    .sort((a, b) => b[1].total - a[1].total) // Ordenar por total descendente
    .slice(0, 10); // Mostrar solo los top 10

  const chartData = sortedCourses.map(([courseName, data]) => ({
    name: courseName.length > 20 ? courseName.substring(0, 20) + "..." : courseName,
    fullName: courseName,
    regular: data.regular,
    cetar: data.cetar,
    total: data.total,
  }));

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params: any) {
        const data = params[0];
        const fullName = chartData.find(item => item.name === data.name)?.fullName || data.name;
        let tooltip = `<strong>${fullName}</strong><br/>`;
        
        params.forEach((param: any) => {
          tooltip += `${param.marker} ${param.seriesName}: ${param.value}<br/>`;
        });
        
        return tooltip;
      },
    },
    legend: {
      data: ["Certificados Regulares", "Certificados CETAR"],
      top: "0%",
      textStyle: {
        fontSize: 12,
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: chartData.map(item => item.name),
      axisLabel: {
        rotate: 45,
        fontSize: 10,
        interval: 0,
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: "value",
      name: "Número de Certificados",
      nameLocation: "middle",
      nameGap: 50,
      nameTextStyle: {
        fontSize: 12,
        fontWeight: "bold",
      },
      axisLabel: {
        fontSize: 10,
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: "dashed",
          opacity: 0.3,
        },
      },
    },
    series: [
      {
        name: "Certificados Regulares",
        type: "bar",
        stack: "certificates",
        data: chartData.map(item => item.regular),
        itemStyle: {
          color: "#3b82f6", // Azul
        },
        emphasis: {
          focus: "series",
        },
      },
      {
        name: "Certificados CETAR",
        type: "bar",
        stack: "certificates",
        data: chartData.map(item => item.cetar),
        itemStyle: {
          color: "#10b981", // Verde
        },
        emphasis: {
          focus: "series",
        },
      },
    ],
    title: {
      show: sortedCourses.length === 0,
      textStyle: {
        color: "grey",
        fontSize: 16,
      },
      text: "Sin certificados disponibles",
      left: "center",
      top: "center",
    },
  };

  return (
    <div className="h-full">
      <Chart 
        option={option} 
        title="Certificaciones por Curso" 
        className="h-[400px]"
      />
      
      {/* Información adicional */}
      {sortedCourses.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Resumen:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Total de cursos con certificados:</span>
              <span className="ml-2">{Object.keys(courseData).length}</span>
            </div>
            <div>
              <span className="font-medium">Total certificados regulares:</span>
              <span className="ml-2 text-blue-600">
                {Object.values(courseData).reduce((sum, data) => sum + data.regular, 0)}
              </span>
            </div>
            <div>
              <span className="font-medium">Total certificados CETAR:</span>
              <span className="ml-2 text-green-600">
                {Object.values(courseData).reduce((sum, data) => sum + data.cetar, 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 