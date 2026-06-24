import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { createProject, updateProject } from "@/api/projects/projects";
import {
  PROJECT_STATUSES,
  type Project,
  type ProjectFormInput,
  ProjectFormSchema,
} from "@/api/projects/types";
import { useRevalidateProjects } from "@/api/projects/useProjects";
import { SubmissionButton } from "@/components/blocks/submission-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog edits this project; otherwise it creates a new one. */
  project?: Project;
}

const EMPTY: ProjectFormInput = { name: "", description: "", status: "active" };

export function ProjectFormDialog({ open, onOpenChange, project }: Props) {
  const revalidate = useRevalidateProjects();
  const isEdit = Boolean(project);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormInput>({
    resolver: zodResolver(ProjectFormSchema),
    defaultValues: EMPTY,
  });

  // Sync form values whenever the dialog opens (with or without a project to edit).
  useEffect(() => {
    if (open) {
      reset(
        project
          ? { name: project.name, description: project.description, status: project.status }
          : EMPTY,
      );
    }
  }, [open, project, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const result = project ? await updateProject(project.id, values) : await createProject(values);

    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    toast.success(isEdit ? "Project updated" : "Project created");
    await revalidate();
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this project."
              : "Add a new project to your workspace."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter className="mt-2">
            <SubmissionButton type="submit" loading={isSubmitting}>
              {isEdit ? "Save changes" : "Create project"}
            </SubmissionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
