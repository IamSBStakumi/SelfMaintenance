import { MaintenanceItem } from "@/types/maintenance";
import MaintenanceItemCard from "./MaintenanceItemCard";

const PageContent = ({ items }: { items: MaintenanceItem[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <MaintenanceItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};

export default PageContent;
