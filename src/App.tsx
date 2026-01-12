import { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import type { DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import type { Artwork, ApiResponse } from './types';

const ROWS_PER_PAGE = 12;

export default function App() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Persistent selection - simplified to track only selected items
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const overlayRef = useRef<OverlayPanel>(null);
  const [selectCount, setSelectCount] = useState<number | null>(null);

  // Fetch artworks (SERVER-SIDE PAGINATION)
  useEffect(() => {
    setLoading(true);
    fetch(`https://api.artic.edu/api/v1/artworks?page=${page}`)
      .then(res => res.json())
      .then((res: ApiResponse) => {
        setArtworks(res.data);
        setTotalRecords(res.pagination.total);
      })
      .finally(() => setLoading(false));
  }, [page]);

  // Selected rows for current page
  const selectedRows = artworks.filter(art => selectedIds.has(art.id));

  // Handle selection change from PrimeReact's built-in selection
  const onSelectionChange = (e: { value: Artwork[] }) => {
  const currentPageSelection = e.value;
  const currentPageIds = new Set<number>(
    currentPageSelection.map(item => item.id)
  );
  const currentPageAllIds = new Set<number>(
    artworks.map(art => art.id)
  );

  setSelectedIds(prev => {
    const copy = new Set(prev);

    // Remove all current page items
    currentPageAllIds.forEach(id => copy.delete(id));

    // Add selected items from current page
    currentPageIds.forEach(id => copy.add(id));

    return copy;
  });
};


  // Page change
  const onPage = (e: DataTablePageEvent) => {
    setPage(e.page! + 1);
  };

  // Custom select (CURRENT PAGE ONLY)
  const handleCustomSelect = () => {
    if (!selectCount || selectCount <= 0) return;

    const rowsToSelect = artworks.slice(0, Math.min(selectCount, artworks.length));

    setSelectedIds(prev => {
      const copy = new Set(prev);
      rowsToSelect.forEach(r => copy.add(r.id));
      return copy;
    });

    overlayRef.current?.hide();
    setSelectCount(null);
  };

  //const first = (page - 1) * ROWS_PER_PAGE;
  //const last = Math.min(first + ROWS_PER_PAGE, totalRecords);
  const selectedCount = selectedIds.size;

  
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Art Institute of Chicago – Artworks</h2>

       <div style={{ marginBottom: '0.5rem', fontWeight: 500 }}>
         Selected: {selectedCount} rows
        </div>


      <Button
        label="Custom Select"
        icon="pi pi-sliders-h"
        onClick={(e) => overlayRef.current?.toggle(e)}
        style={{ marginBottom: '1rem' }}
      />

      <OverlayPanel ref={overlayRef}>
        <InputNumber
          value={selectCount}
          onValueChange={(e) => setSelectCount(e.value ?? null)}
          placeholder="Rows to select"
        />
        <Button
          label="Apply"
          onClick={handleCustomSelect}
          style={{ marginTop: '0.5rem' }}
        />
      </OverlayPanel>

      <DataTable
        value={artworks}
        paginator
        lazy
        rows={ROWS_PER_PAGE}
        totalRecords={totalRecords}
        loading={loading}
        first={(page - 1) * ROWS_PER_PAGE}
        onPage={onPage}
        selection={selectedRows}
        onSelectionChange={onSelectionChange}
        selectionMode="multiple"
        dataKey="id"

        paginatorTemplate="CurrentPageReport PrevPageLink PageLinks NextPageLink"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
      >

        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Inscriptions" />
        <Column field="date_start" header="Start Year" />
        <Column field="date_end" header="End Year" />
      </DataTable>
      <div
  style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '0.75rem',
    fontSize: '0.9rem'
  }}
>
  </div>

    </div>
  );
}
