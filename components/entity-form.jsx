import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormSelect } from "@/components/ui/form-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function renderField(field) {
  if (field.type === "hidden") {
    return <input key={field.name} name={field.name} type="hidden" value={field.value} />;
  }

  return (
    <div className="space-y-2" key={field.name}>
      <Label htmlFor={field.name}>{field.label}</Label>
      {field.type === "select" ? (
        <FormSelect
          allowEmpty={!field.required}
          emptyLabel={field.emptyLabel || "No selection"}
          name={field.name}
          options={field.options}
          placeholder={`Select ${field.label}`}
          required={field.required}
          value={field.value}
        />
      ) : (
        <Input
          defaultValue={field.value}
          id={field.name}
          min={field.min}
          name={field.name}
          placeholder={field.placeholder}
          required={field.required}
          step={field.step}
          type={field.type || "text"}
        />
      )}
    </div>
  );
}

function EntityForm({ action, fields, helperText, submitLabel, title }) {
  const hiddenFields = fields.filter((field) => field.type === "hidden");
  const visibleFields = fields.filter((field) => field.type !== "hidden");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{helperText}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-5">
          {hiddenFields.map(renderField)}
          <div className="grid gap-4 md:grid-cols-2">{visibleFields.map(renderField)}</div>
          <Button type="submit">{submitLabel}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default EntityForm;
