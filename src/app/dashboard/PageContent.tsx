import SkeletonCard from "./SkeletonCard";
import MaintenanceItemCard from "./MaintenanceItemCard";

import useMaintenanceItems from "@/hooks/useMaintenanceItems";

// ダッシュボードのコンテンツについてのオーケストレーター
const PageContent = () => {
  const { fetchMaintenanceItems } = useMaintenanceItems();
  const { data: items, isPending, isError } = fetchMaintenanceItems;

  return (
    <>
      {/* ローディング中: スケルトンを3件分表示 */}
      {isPending && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* エラー時 */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            データの取得に失敗しました。
          </p>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">
            ページを再読み込みしてお試しください。
          </p>
        </div>
      )}

      {/* データが0件 */}
      {!isPending && !isError && items?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            メンテナンス項目がまだありません。
          </p>
          <p className="text-zinc-400 dark:text-zinc-500 text-sm">
            最初のタスクを追加してみましょう。
          </p>
        </div>
      )}

      {/* 正常にデータが取得できた場合 */}
      {!isPending && !isError && items && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <MaintenanceItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
};

export default PageContent;
