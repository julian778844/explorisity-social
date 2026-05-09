import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type FollowItem } from "./api";
import { useAuth } from "./auth";

export type SchoolType = FollowItem["schoolType"];

export function useFollows() {
  const { user, openSignIn } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["follows"],
    queryFn: async () => (await api.listFollows()).follows,
    enabled: !!user,
    staleTime: 10_000,
  });

  const list: FollowItem[] = query.data ?? [];

  const add = useMutation({
    mutationFn: (v: { schoolType: SchoolType; schoolId: string }) => api.addFollow(v),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: ["follows"] });
      const prev = qc.getQueryData<FollowItem[]>(["follows"]) ?? [];
      const optimistic: FollowItem = {
        id: -Date.now(),
        schoolType: v.schoolType,
        schoolId: v.schoolId,
        createdAt: new Date().toISOString(),
      };
      qc.setQueryData<FollowItem[]>(["follows"], [...prev, optimistic]);
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(["follows"], ctx.prev); },
    onSettled: () => { qc.invalidateQueries({ queryKey: ["follows"] }); },
  });

  const remove = useMutation({
    mutationFn: (v: { schoolType: SchoolType; schoolId: string }) => api.removeFollow(v.schoolType, v.schoolId),
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: ["follows"] });
      const prev = qc.getQueryData<FollowItem[]>(["follows"]) ?? [];
      qc.setQueryData<FollowItem[]>(
        ["follows"],
        prev.filter((f) => !(f.schoolType === v.schoolType && f.schoolId === v.schoolId)),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(["follows"], ctx.prev); },
    onSettled: () => { qc.invalidateQueries({ queryKey: ["follows"] }); },
  });

  function isFollowing(type: SchoolType, id: string): boolean {
    return list.some((f) => f.schoolType === type && f.schoolId === id);
  }

  function toggle(type: SchoolType, id: string) {
    if (!user) {
      openSignIn("signin");
      return;
    }
    if (isFollowing(type, id)) {
      remove.mutate({ schoolType: type, schoolId: id });
    } else {
      add.mutate({ schoolType: type, schoolId: id });
    }
  }

  return { list, isFollowing, toggle, isLoading: query.isPending };
}
