import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import type { LoginFormValues } from "@/lib/validators";
import type { ApiResponse, User } from "@/types";

export const authKeys = {
  me: ["auth", "me"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const res = await apiRequest<ApiResponse<{ user: User }>>("/api/auth/me");
      return res.data.user;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const res = await apiRequest<ApiResponse<{ user: User }>>(
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify(values),
        }
      );
      return res.data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user);
      toast.success(`Welcome back, ${user.name}`);
      router.push("/dashboard");
      router.refresh();
    },
    onError: (err: Error) => {
      toast.error(err.message || "Invalid email or password");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiRequest("/api/auth/logout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    },
  });
}
