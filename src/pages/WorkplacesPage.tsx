import { useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronLeft,
  FileSpreadsheet,
  FolderTree,
  GitMerge,
  MoveRight,
  Pencil,
  PlusCircle,
  Tags,
  Trash,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import WorkplaceSelect from "@/components/WorkplaceSelect";
import WorkplacesImportDialog from "@/components/WorkplacesImportDialog";
import { WorkplacesService } from "@/services/workplaces.service";
import { normalizeName } from "@/lib/normalizeName";
import { WORKPLACE_CATEGORIES, WorkplaceCategory, WorkplaceNode } from "@/types";
import WorkplaceCategoryTabs from "@/components/WorkplaceCategoryTabs";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { roleChecker } from "@/lib/roleChecker";

type Action =
  | { type: "add"; parent: WorkplaceNode | null; category: WorkplaceCategory }
  | { type: "category"; node: WorkplaceNode }
  | { type: "rename"; node: WorkplaceNode }
  | { type: "move"; node: WorkplaceNode }
  | { type: "merge"; node: WorkplaceNode }
  | { type: "aliases"; node: WorkplaceNode }
  | { type: "delete"; node: WorkplaceNode };

const errorMessage = (error: unknown) =>
  error instanceof AxiosError
    ? error.response?.data?.message || "حدث خطأ"
    : "حدث خطأ";

const collectIds = (node: WorkplaceNode): number[] => [
  node.id,
  ...node.children.flatMap(collectIds),
];

/** keeps nodes matching the search, plus their ancestors */
const filterTree = (
  nodes: WorkplaceNode[],
  predicate: (n: WorkplaceNode) => boolean,
): WorkplaceNode[] =>
  nodes
    .map((n) => {
      const children = filterTree(n.children, predicate);
      if (predicate(n) || children.length) return { ...n, children };
      return null;
    })
    .filter((n): n is WorkplaceNode => n !== null);

export default function WorkplacesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const needsReviewOnly = searchParams.get("needsReview") === "true";
  // two separate trees: النيابات / جهات العمل الأخرى (kept in the url)
  const category: WorkplaceCategory =
    searchParams.get("category") === "other" ? "other" : "prosecution";
  const setParam = (key: string, value: string | null) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      return next;
    });
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [action, setAction] = useState<Action | null>(null);
  const queryClient = useQueryClient();
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = roleChecker(user, "admin");

  const { data: tree, isLoading } = useQuery({
    queryKey: ["workplaces", "tree"],
    queryFn: WorkplacesService.getTree,
  });

  // roots of the selected tree (a whole branch always shares its root's category)
  const categoryTree = useMemo(
    () => (tree ?? []).filter((n) => n.category === category),
    [tree, category],
  );
  const countNodes = (nodes: WorkplaceNode[]): number =>
    nodes.reduce((s, n) => s + 1 + countNodes(n.children), 0);
  const categoryCounts = useMemo(
    () => ({
      prosecution: countNodes((tree ?? []).filter((n) => n.category === "prosecution")),
      other: countNodes((tree ?? []).filter((n) => n.category === "other")),
    }),
    [tree],
  );

  const reviewCount = useMemo(() => {
    let count = 0;
    const walk = (nodes: WorkplaceNode[]) =>
      nodes.forEach((n) => {
        if (n.needsReview) count++;
        walk(n.children);
      });
    walk(categoryTree);
    return count;
  }, [categoryTree]);

  const searching = !!search.trim() || needsReviewOnly;
  const visibleTree = useMemo(() => {
    const s = normalizeName(search);
    if (!searching) return categoryTree;
    return filterTree(
      categoryTree,
      (n) =>
        (!needsReviewOnly || !!n.needsReview) &&
        (!s ||
          normalizeName(n.name).includes(s) ||
          !!n.aliases?.some((a) => normalizeName(a.name).includes(s))),
    );
  }, [categoryTree, search, needsReviewOnly, searching]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["workplaces"] });
    queryClient.invalidateQueries({ queryKey: ["trainees"] });
  };

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const markReviewed = useMutation({
    mutationFn: (id: number) =>
      WorkplacesService.update(id, { needsReview: false }),
    onSuccess: () => {
      invalidate();
      toast.success("تم اعتماد الجهة");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const renderNode = (node: WorkplaceNode, depth: number) => {
    const isOpen = searching || expanded.has(node.id);
    const hasChildren = node.children.length > 0;
    return (
      <li key={node.id}>
        <div
          className={cn(
            "group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted",
            node.needsReview && "bg-amber-50 dark:bg-amber-950/30",
          )}
          style={{ paddingInlineStart: `${0.5 + depth * 1.5}rem` }}
        >
          <button
            type="button"
            className={cn("w-5", !hasChildren && "invisible")}
            onClick={() => toggle(node.id)}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
          <span className="font-medium">{node.name}</span>
          <span className="text-xs text-muted-foreground">
            ({node.traineesCount ?? 0} مستهدف
            {hasChildren ? ` / ${node.totalTraineesCount} مع الفروع` : ""})
          </span>
          {!!node.aliases?.length && (
            <span className="text-xs text-muted-foreground truncate max-w-64">
              — أسماء بديلة: {node.aliases.map((a) => a.name).join("، ")}
            </span>
          )}
          {node.needsReview &&
            (isAdmin ? (
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs border-amber-400 text-amber-700"
                onClick={() => markReviewed.mutate(node.id)}
              >
                تحتاج مراجعة — اعتماد
              </Button>
            ) : (
              <span className="text-xs text-amber-700">تحتاج مراجعة</span>
            ))}
          {isAdmin && (
          <div className="ms-auto flex gap-1 opacity-60 group-hover:opacity-100">
            <IconButton
              title="إضافة جهة فرعية"
              onClick={() => setAction({ type: "add", parent: node, category: node.category })}
            >
              <PlusCircle />
            </IconButton>
            <IconButton title="تعديل الاسم" onClick={() => setAction({ type: "rename", node })}>
              <Pencil />
            </IconButton>
            <IconButton title="نقل تحت جهة أخرى" onClick={() => setAction({ type: "move", node })}>
              <MoveRight />
            </IconButton>
            {depth === 0 && (
              <IconButton
                title={`نقل إلى ${WORKPLACE_CATEGORIES[node.category === "prosecution" ? "other" : "prosecution"]}`}
                onClick={() => setAction({ type: "category", node })}
              >
                <ArrowLeftRight />
              </IconButton>
            )}
            <IconButton title="دمج مع جهة أخرى" onClick={() => setAction({ type: "merge", node })}>
              <GitMerge />
            </IconButton>
            <IconButton title="الأسماء البديلة" onClick={() => setAction({ type: "aliases", node })}>
              <Tags />
            </IconButton>
            <IconButton title="حذف" destructive onClick={() => setAction({ type: "delete", node })}>
              <Trash />
            </IconButton>
          </div>
          )}
        </div>
        {hasChildren && isOpen && (
          <ul>{node.children.map((c) => renderNode(c, depth + 1))}</ul>
        )}
      </li>
    );
  };

  return (
    <div className="container mx-auto py-10">
      <Helmet>
        <title>إدارة التدريب | دليل جهات العمل</title>
      </Helmet>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FolderTree /> دليل جهات العمل
        </h1>
        {/* changing the directory is reserved to the admin (also enforced by the API) */}
        {isAdmin && (
        <div className="flex gap-2">
          <WorkplacesImportDialog>
            <Button variant="outline">
              <span>استيراد / تعديل من إكسل</span>
              <FileSpreadsheet />
            </Button>
          </WorkplacesImportDialog>
          <Button onClick={() => setAction({ type: "add", parent: null, category })}>
            <span>إضافة جهة رئيسية إلى {WORKPLACE_CATEGORIES[category]}</span>
            <PlusCircle />
          </Button>
        </div>
        )}
      </div>
      <WorkplaceCategoryTabs
        value={category}
        onChange={(v) => v !== "all" && setParam("category", v === "other" ? "other" : null)}
        counts={categoryCounts}
        className="mb-4"
      />
      <div className="flex items-center gap-4 mb-4">
        <Input
          className="w-96"
          placeholder="بحث (يشمل الأسماء البديلة)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Checkbox
            checked={needsReviewOnly}
            onCheckedChange={(c) => {
              setParam("needsReview", c ? "true" : null);
            }}
          />
          تحتاج مراجعة فقط ({reviewCount})
        </label>
        {!searching && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setExpanded((prev) =>
                prev.size ? new Set() : new Set((tree ?? []).flatMap(collectIds)),
              )
            }
          >
            {expanded.size ? "طي الكل" : "توسيع الكل"}
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        الجهات التي تُضاف تلقائياً من ملفات الإكسل تظهر بلون مميز "تحتاج
        مراجعة". عند وجود نفس الجهة بكتابتين مختلفتين استخدم "دمج" وسيتم حفظ
        الكتابة القديمة كاسم بديل لتُربط بها الملفات القادمة تلقائياً.
      </p>
      <div className="rounded-md border p-2">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-6">جاري التحميل...</p>
        ) : visibleTree.length ? (
          <ul>{visibleTree.map((n) => renderNode(n, 0))}</ul>
        ) : (
          <p className="text-center text-muted-foreground py-6">لا توجد جهات</p>
        )}
      </div>

      {action && (
        <ActionDialog
          action={action}
          onClose={() => setAction(null)}
          onDone={() => {
            invalidate();
            if (action.type === "add" && action.parent)
              setExpanded((prev) => new Set(prev).add(action.parent!.id));
          }}
        />
      )}
    </div>
  );
}

function IconButton({
  children,
  title,
  onClick,
  destructive,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <Button
      type="button"
      size="sm"
      title={title}
      variant={destructive ? "destructive" : "ghost"}
      className="h-7 w-7 p-0 [&_svg]:size-4"
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function ActionDialog({
  action,
  onClose,
  onDone,
}: {
  action: Action;
  onClose: () => void;
  onDone: () => void;
}) {
  const node = action.type === "add" ? null : action.node;
  const [name, setName] = useState(action.type === "rename" ? action.node.name : "");
  const [target, setTarget] = useState<{ workplaceId: number | null; name: string }>(
    action.type === "move" && action.node.parentId
      ? { workplaceId: action.node.parentId, name: "" }
      : { workplaceId: null, name: "" },
  );
  const excludeIds = node ? collectIds(node) : [];

  const mutation = useMutation({
    mutationFn: async () => {
      switch (action.type) {
        case "add":
          return WorkplacesService.create({
            name,
            parentId: action.parent?.id ?? null,
            category: action.category,
          });
        case "category":
          return WorkplacesService.update(action.node.id, {
            category: action.node.category === "prosecution" ? "other" : "prosecution",
          });
        case "rename":
          return WorkplacesService.update(action.node.id, { name });
        case "move":
          return WorkplacesService.update(action.node.id, {
            parentId: target.workplaceId,
          });
        case "merge":
          if (!target.workplaceId) throw new Error("اختر الجهة");
          return WorkplacesService.merge(action.node.id, target.workplaceId);
        case "aliases":
          return WorkplacesService.addAlias(action.node.id, name);
        case "delete":
          return WorkplacesService.remove(action.node.id);
      }
    },
    onSuccess: () => {
      toast.success("تمت العملية بنجاح");
      onDone();
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const removeAlias = useMutation({
    mutationFn: (aliasId: number) => WorkplacesService.removeAlias(aliasId),
    onSuccess: () => {
      toast.success("تم حذف الاسم البديل");
      onDone();
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const titles: Record<Action["type"], string> = {
    add: action.type === "add" && action.parent
      ? `إضافة جهة فرعية تحت "${action.parent.name}"`
      : `إضافة جهة رئيسية إلى ${action.type === "add" ? WORKPLACE_CATEGORIES[action.category] : ""}`,
    category: `نقل "${node?.name}" إلى ${
      WORKPLACE_CATEGORIES[node?.category === "prosecution" ? "other" : "prosecution"]
    }`,
    rename: `تعديل اسم "${node?.name}"`,
    move: `نقل "${node?.name}"`,
    merge: `دمج "${node?.name}" مع جهة أخرى`,
    aliases: `الأسماء البديلة لـ "${node?.name}"`,
    delete: `حذف "${node?.name}"`,
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>{titles[action.type]}</DialogTitle>
          {action.type === "merge" && (
            <DialogDescription>
              سيتم نقل كل المستهدفين والجهات الفرعية إلى الجهة المختارة، وحفظ
              "{node?.name}" كاسم بديل لها.
            </DialogDescription>
          )}
          {action.type === "category" && node && (
            <DialogDescription>
              ستنتقل الجهة مع كل جهاتها الفرعية ({collectIds(node).length} جهة،{" "}
              {node.totalTraineesCount} مستهدف) من {WORKPLACE_CATEGORIES[node.category]}{" "}
              إلى{" "}
              {WORKPLACE_CATEGORIES[node.category === "prosecution" ? "other" : "prosecution"]}.
              لا يتغير شيء في بيانات المستهدفين.
            </DialogDescription>
          )}
          {action.type === "move" && (
            <DialogDescription>
              إذا اخترت جهة رئيسية من التصنيف الآخر، تنتقل الجهة مع فروعها إلى
              ذلك التصنيف.
            </DialogDescription>
          )}
          {action.type === "rename" && (
            <DialogDescription>
              سيتم تحديث جهة العمل لكل المستهدفين المرتبطين، ويُحفظ الاسم
              القديم كاسم بديل.
            </DialogDescription>
          )}
          {action.type === "delete" && (
            <DialogDescription>
              الجهات الفرعية ستنتقل إلى المستوى الأعلى. لا يمكن حذف جهة مرتبط
              بها مستهدفون (استخدم الدمج بدلاً من ذلك).
            </DialogDescription>
          )}
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          {(action.type === "add" || action.type === "rename" || action.type === "aliases") && (
            <div className="space-y-2">
              <Label>{action.type === "aliases" ? "اسم بديل جديد" : "اسم الجهة"}</Label>
              <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          {action.type === "aliases" && (
            <ul className="flex flex-wrap gap-2">
              {node?.aliases?.length ? (
                node.aliases.map((a) => (
                  <li key={a.id} className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-sm">
                    {a.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeAlias.mutate(a.id)}
                    />
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">لا توجد أسماء بديلة</li>
              )}
            </ul>
          )}
          {(action.type === "move" || action.type === "merge") && (
            <div className="space-y-2">
              <Label>
                {action.type === "move"
                  ? "الجهة الرئيسية الجديدة (اتركها فارغة لجعلها جهة رئيسية)"
                  : "دمج في"}
              </Label>
              <WorkplaceSelect
                value={target}
                onChange={setTarget}
                excludeIds={excludeIds}
                category={node?.category}
                allowClear={action.type === "move"}
              />
            </div>
          )}
          <Button
            type="submit"
            className="w-full"
            variant={action.type === "delete" ? "destructive" : "default"}
            disabled={
              mutation.isPending ||
              ((action.type === "add" || action.type === "rename" || action.type === "aliases") &&
                !name.trim()) ||
              (action.type === "merge" && !target.workplaceId)
            }
          >
            {action.type === "delete"
              ? "حذف"
              : action.type === "aliases"
                ? "إضافة"
                : action.type === "category"
                  ? "نقل"
                  : "حفظ"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
