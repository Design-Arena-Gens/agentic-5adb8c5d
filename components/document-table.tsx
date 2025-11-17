"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDMS } from "@/components/providers";
import { StatusBadge } from "@/components/status-badge";
import { SecurityBadge } from "@/components/security-badge";
import { formatDate } from "@/lib/formatters";

export function DocumentTable() {
  const { documents, documentTypes } = useDMS();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const typeMap = useMemo(() => {
    return Object.fromEntries(documentTypes.map((type) => [type.id, type.type]));
  }, [documentTypes]);

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = [
        doc.title,
        doc.documentNumber,
        typeMap[doc.typeId] ?? "",
        doc.category,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesType = typeFilter === "all" || doc.typeId === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [documents, search, typeFilter, typeMap]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            className="w-64"
            placeholder="Search documents"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="w-48"
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
          >
            <option value="all">All types</option>
            {documentTypes.map((type) => (
              <option value={type.id} key={type.id}>
                {type.type}
              </option>
            ))}
          </select>
        </div>
        <Link href="/documents/new" className="primary">
          New Controlled Document
        </Link>
      </div>

      <div className="table">
        <table className="min-w-full">
          <thead>
            <tr>
              <th>Document</th>
              <th>Type</th>
              <th>Lifecycle</th>
              <th>Security</th>
              <th>Issued</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filtered.map((doc) => (
              <tr key={doc.id} className="bg-white hover:bg-slate-50">
                <td className="py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-700">
                      {doc.title}
                    </span>
                    <span className="text-xs text-slate-500">
                      {doc.documentNumber} · Version {doc.documentVersion}
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  <span className="text-sm text-slate-600">
                    {typeMap[doc.typeId] ?? "Unknown"}
                  </span>
                </td>
                <td className="py-3">
                  <StatusBadge state={doc.lifecycleState} />
                </td>
                <td className="py-3">
                  <SecurityBadge level={doc.securityLevel} />
                </td>
                <td className="py-3 text-sm text-slate-600">
                  {formatDate(doc.dateOfIssue)}
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/documents/${doc.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                  No documents match your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
