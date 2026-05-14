import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faExternalLinkAlt,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  open: boolean;
  onClose: () => void;
  url: string | null | undefined;
  title?: string;
}

const ScoutReportPreviewModal: React.FC<Props> = ({
  open,
  onClose,
  url,
  title,
}) => {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faFilePdf} className="text-red-600" />
            Scouting Report
          </DialogTitle>
          {title && (
            <DialogDescription className="truncate">{title}</DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
          {url ? (
            <iframe
              src={url}
              title="Scouting report"
              className="w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No report available
            </div>
          )}
        </div>

        <DialogFooter className="p-3 border-t flex flex-wrap gap-2 sm:justify-between sm:flex-row">
          <div className="text-xs text-gray-500 dark:text-gray-400 self-center">
            Trouble viewing? Use Download or Open in new tab.
          </div>
          <div className="flex gap-2">
            {url && (
              <>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
                >
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                  Open in new tab
                </a>
                <a
                  href={url}
                  download
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Download
                </a>
              </>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScoutReportPreviewModal;
