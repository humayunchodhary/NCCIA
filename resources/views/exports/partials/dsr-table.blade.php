@if(empty($rows))
    <p>NIL</p>
@else
<table>
    <thead>
        <tr>
            <th>Sr.#</th>
            @foreach($columns as $col)
                <th>{{ str_replace('_', ' ', ucwords($col)) }}</th>
            @endforeach
        </tr>
    </thead>
    <tbody>
        @foreach($rows as $i => $row)
            <tr>
                <td>{{ $i + 1 }}</td>
                @foreach($columns as $col)
                    <td>{{ is_array($row) ? ($row[$col] ?? '') : ($row->{$col} ?? '') }}</td>
                @endforeach
            </tr>
        @endforeach
    </tbody>
</table>
@endif
