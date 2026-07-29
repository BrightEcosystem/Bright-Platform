"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Envia o formulário automaticamente ao montar — usado para o caso de o
 * usuário ter apenas uma empresa: ele "entra diretamente" (sem precisar
 * clicar), mas ainda como uma submissão real de formulário para o Server
 * Action (que é o único jeito seguro de gravar o cookie de empresa ativa).
 */
export function AutoSubmitForm({
  action,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  return (
    <form ref={formRef} action={action}>
      {children}
    </form>
  );
}
