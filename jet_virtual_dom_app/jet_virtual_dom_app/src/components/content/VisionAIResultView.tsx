import { h, ComponentProps } from "preact";
import { useRef, useState, useEffect } from "preact/hooks";
import "ojs/ojlistview";
import "ojs/ojkeyset";
import MutableArrayDataProvider = require("ojs/ojmutablearraydataprovider");
import { ojListView } from "ojs/ojlistview";
import "ojs/ojinputtext";
import { ojInputText } from "ojs/ojinputtext";
import { CTextAreaElement } from "oj-c/text-area"
import "oj-c/text-area";
import { ojSelectSingle } from "ojs/ojselectsingle";

const initialState = {
  objectNames: [],
  words: [],
  combinedText: ''
};
type Props = {
  activity: Item | null;
};
type Item = {
  bucketName?: string | undefined;
  selectImage?: string;
  regionName?: string;
};
type ListViewProps = ComponentProps<"oj-list-view">;
const gridlinesItemVisible: ListViewProps["gridlines"] = { item: "visible" };
const scrollPolicyOpts: ListViewProps["scrollPolicyOptions"] = { fetchSize: 10 };
const listItemRenderer = (item: ojListView.ItemTemplateContext) => {
  return ( <div class="oj-flex no-wrap">
      <div class="demo-content oj-flex-item">
        <div>
          <strong>{item.index + 1}. {item.data}</strong>
        </div>
      </div>
    </div>
  );
};
export function ListView(props: Props) {
  const [data, setData] = useState(initialState);
  const [lovData, setLovData] = useState({
    selectedValue: ""
  });
  const url = props.activity?.selectImage;
  const regionName = props.activity?.regionName;
  const bucketName = props.activity?.bucketName;
  console.log("regionName", regionName);
  let imageName: string = "";
  if (url) {
    let parts = url.split("/");
    imageName = parts.length > 0 ? parts[parts.length - 1] : "No image name found";
    console.log(imageName);
  }
  if (imageName) {
    const serviceUrl = `http://localhost:8080/ai/vision/image?object=${imageName}&bucket=${bucketName}&region=${regionName}`;
    useEffect(() => {
      fetch(serviceUrl)
        .then((response) => response.json())
        .then((result) => {
          setData({
            objectNames: result.imageObjects ? result.imageObjects.map((obj: { name: any; }) => obj.name) : [],
            words: result.imageText?.words || [], 
            combinedText: result.imageText?.words ? result.imageText.words.map((word: { text: any; }) => word.text).join(' ') : ''
          });

        })
        .catch((error) => {
          console.error("Error fetching LOV data:", error);
        });
    }, [imageName]);
  }
  const { objectNames, combinedText } = data;
  const dataProvider = new MutableArrayDataProvider(objectNames, {
    keyAttributes: "name",
  });

  const highlightNumbers = (text: string) => {
    // Use regex to find all numbers in the text
    const regex = /\b\d+\b/g;
    // Replace each number with a span containing the number, styled to be yellow
    return text.replace(regex, (match) => `<span style="background-color: yellow">${match}</span>`);
  };
  const [filteredText, setFilteredText] = useState(combinedText);
  const filterText = (value: string) => {
    console.log(value);
    if (value === "numbersOnly") {
      // Filter only numbers from the combined text
      const regex = /\b\d+\b/g;
      const numbersOnly = combinedText.match(regex)?.join(" ") || "";
      setFilteredText(numbersOnly);
    } else {
      // Reset to the original combined text
      setFilteredText(combinedText);
    }
  };
  const selectRef = useRef<any>(null);
  const onFilterChange = (event: any) => {
    const value = event.detail.value;
    console.log("event.detail.value", event.detail.value);
    setLovData(prevState => ({
      ...prevState,
      selectedValue: value
    }))
    filterText(value);
  };
  const optionsDataProvider = new MutableArrayDataProvider(
    [{ value: "", label: "All" }, { value: "numbersOnly", label: "Numbers Only" }],
    { keyAttributes: "value" }
  );

  return (
    <>
      <div class="oj-flex-item oj-sm-padding-12x-start oj-md-6 oj-sm-12">
        <h1 style={{ fontWeight: 'bold' }}>Vision AI Result</h1>
        <div style={{ marginLeft: '20px' }}> 
          <h2 style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Object detection({objectNames.length})</h2>
          <div>
            <oj-list-view id="itemsList" class="item-display"
              aria-labelledby="activitiesHeader"
              aria-label="list of objects"
              data={dataProvider}
              gridlines={gridlinesItemVisible}
              selectionMode="multiple"
              scrollPolicy="loadMoreOnScroll"
              scrollPolicyOptions={scrollPolicyOpts}>
              <template slot="itemTemplate" render={listItemRenderer}></template>
            </oj-list-view>
          </div>
          <h2 style={{ fontWeight: 'bold', fontSize: '1.1em' }}>Text detection</h2>
          <div> <div>
              <label style={{ fontSize: '14px', marginBottom: '10px' }}> Filter Result:</label>
              <oj-select-single
                ref={selectRef}
                data={optionsDataProvider}
                value={lovData.selectedValue}
                onvalueChanged={onFilterChange}
                style={{ maxWidth: '200px', paddingLeft: '14px' }}
              ></oj-select-single>
            </div>
          </div>
          <div>
            <div dangerouslySetInnerHTML={{ __html: highlightNumbers(filteredText ? filteredText : combinedText) }}></div></div>
        </div>
      </div>
    </>);}
