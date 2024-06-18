import { h } from "preact";
import { useState } from "preact/hooks";
import { ListView } from "./VisionAIResultView";
import { FormElements } from "./ObjectStorageForm";
type attr = {
  bucketName?: string | undefined;
  selectImage?: string| undefined;
  regionName?: string| undefined;
};
type Props = {
  onActivityChanged: (event: any) => void;
};

export function ParentContainer(){
const [formData, setFormData] = useState<attr | null>({
  });
  const activityChangedHandler = (data: any) => {
    setFormData(data);
  };
return (
    <div id="parentContainer" class="oj-flex oj-flex-init parent-container" style={{ marginLeft: '100px' }} >
      <div class="separator-line"></div>
     <FormElements  onActivityChanged={activityChangedHandler}/>
     {formData && <ListView  activity={formData} />}
    
    </div>
  );
};