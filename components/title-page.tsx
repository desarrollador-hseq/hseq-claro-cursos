import { Card, CardHeader, CardTitle } from "./ui/card";

const TitlePage = ({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) => {
  return (
    <Card className="bg-white border-none shadow-md mb-4">
      <CardHeader className="flex flex-row justify-between">
        <div className="flex items-center gap-3">
          <CardTitle className="flex items-center gap-3 text-2xl text-blue-900">
            {icon && (
              <div className="flex h-10 w-10 items-center justify-center  text-primary">
                {icon}
              </div>
            )}

            {title}
          </CardTitle>
          <p className="text-secondary mt-2">{description}</p>
        </div>
        <div className="flex items-center gap-3">{children}</div>
      </CardHeader>
    </Card>
  );
};

export default TitlePage;
